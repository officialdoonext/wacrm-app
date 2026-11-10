
package com.menext

import android.app.Activity
import android.content.Intent
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.provider.OpenableColumns
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import java.io.File
import java.io.FileOutputStream

class NativeMediaPickerModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var pendingPromise: Promise? = null
    private var pendingRequestCode: Int = 0

    private var mediaRecorder: MediaRecorder? = null
    private var audioFilePath: String? = null
    private var recordingStartTime: Long = 0

    companion object {
        const val REQUEST_PICK_IMAGE = 51001
        const val REQUEST_PICK_VIDEO = 51002
        const val REQUEST_PICK_DOC = 51003
    }

    // Activity result listener
    private val activityEventListener = object : BaseActivityEventListener() {

        override fun onActivityResult(
            activity: Activity,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode != pendingRequestCode) return

            val promise = pendingPromise

            pendingPromise = null
            pendingRequestCode = 0

            val uri: Uri? = data?.data

            if (resultCode != Activity.RESULT_OK || uri == null) {
                promise?.reject(
                    "CANCELLED",
                    "User cancelled media selection"
                )
                return
            }

            try {
                val map = WritableNativeMap()

                var fileName = "file_${System.currentTimeMillis()}"
                var fileSize = 0L

                reactApplicationContext.contentResolver
                    .query(uri, null, null, null, null)?.use { cursor ->

                        val nameIndex =
                            cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)

                        val sizeIndex =
                            cursor.getColumnIndex(OpenableColumns.SIZE)

                        if (cursor.moveToFirst()) {
                            if (nameIndex != -1) {
                                fileName =
                                    cursor.getString(nameIndex) ?: fileName
                            }

                            if (sizeIndex != -1) {
                                fileSize = cursor.getLong(sizeIndex)
                            }
                        }
                    }

                val mimeType =
                    reactApplicationContext.contentResolver.getType(uri)
                        ?: when (requestCode) {
                            REQUEST_PICK_IMAGE -> "image/jpeg"
                            REQUEST_PICK_VIDEO -> "video/mp4"
                            else -> "application/pdf"
                        }

                val ext = when {
                    mimeType.contains("png") -> ".png"
                    mimeType.contains("jpg") ||
                            mimeType.contains("jpeg") -> ".jpg"
                    mimeType.contains("mp4") -> ".mp4"
                    mimeType.contains("pdf") -> ".pdf"
                    else -> ""
                }

                val safeName =
                    if (fileName.contains(".")) fileName
                    else "$fileName$ext"

                val destFile = File(
                    reactApplicationContext.cacheDir,
                    "picked_${System.currentTimeMillis()}_$safeName"
                )

                reactApplicationContext.contentResolver
                    .openInputStream(uri)?.use { input ->

                        FileOutputStream(destFile).use { output ->
                            input.copyTo(output)
                        }
                    }

                val finalUri =
                    if (destFile.exists() && destFile.length() > 0) {
                        "file://${destFile.absolutePath}"
                    } else {
                        uri.toString()
                    }

                map.putString("uri", finalUri)
                map.putString("name", safeName)
                map.putString("type", mimeType)

                map.putDouble(
                    "size",
                    (
                        if (destFile.exists()) destFile.length()
                        else fileSize
                    ).toDouble()
                )

                promise?.resolve(map)

            } catch (e: Exception) {
                promise?.reject("ERROR", e.message, e)
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "NativeMediaPicker"

    // Common picker launcher
    private fun launchPicker(
        promise: Promise,
        requestCode: Int,
        intent: Intent,
        chooserTitle: String
    ) {
        val activity = reactApplicationContext.currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }

        if (pendingPromise != null) {
            promise.reject(
                "PICKER_BUSY",
                "Another media selection is already in progress"
            )
            return
        }

        pendingPromise = promise
        pendingRequestCode = requestCode

        try {
            activity.startActivityForResult(
                Intent.createChooser(intent, chooserTitle),
                requestCode
            )
        } catch (e: Exception) {
            pendingPromise = null
            pendingRequestCode = 0
            promise.reject("PICKER_ERROR", e.message, e)
        }
    }

    // Pick image
    @ReactMethod
    fun pickImage(promise: Promise) {

        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }

        launchPicker(
            promise,
            REQUEST_PICK_IMAGE,
            intent,
            "Choose Photo from Device"
        )
    }

    // Pick video
    @ReactMethod
    fun pickVideo(promise: Promise) {

        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "video/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }

        launchPicker(
            promise,
            REQUEST_PICK_VIDEO,
            intent,
            "Choose Video from Device"
        )
    }

    // Pick document
    @ReactMethod
    fun pickDocument(promise: Promise) {

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            type = "*/*"

            putExtra(
                Intent.EXTRA_MIME_TYPES,
                arrayOf(
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "text/plain",
                    "application/zip"
                )
            )

            addCategory(Intent.CATEGORY_OPENABLE)
        }

        launchPicker(
            promise,
            REQUEST_PICK_DOC,
            intent,
            "Choose Document from Device"
        )
    }

    // Start audio recording
    @ReactMethod
    fun startAudioRecording(promise: Promise) {
        try {
            if (mediaRecorder != null) {
                promise.reject(
                    "ALREADY_RECORDING",
                    "Audio recording is already in progress"
                )
                return
            }

            val audioDir = File(
                reactApplicationContext.cacheDir,
                "audio_notes"
            )

            if (!audioDir.exists()) {
                audioDir.mkdirs()
            }

            val file = File(
                audioDir,
                "rec_${System.currentTimeMillis()}.m4a"
            )

            audioFilePath = file.absolutePath

            mediaRecorder =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    MediaRecorder(reactApplicationContext)
                } else {
                    @Suppress("DEPRECATION")
                    MediaRecorder()
                }

            mediaRecorder?.apply {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setOutputFile(file.absolutePath)

                prepare()
                start()
            }

            recordingStartTime = System.currentTimeMillis()

            promise.resolve(file.absolutePath)

        } catch (e: Exception) {
            mediaRecorder?.release()
            mediaRecorder = null

            promise.reject("RECORD_ERROR", e.message, e)
        }
    }

    // Stop audio recording
    @ReactMethod
    fun stopAudioRecording(promise: Promise) {
        try {
            val durationSecs =
                ((System.currentTimeMillis() - recordingStartTime) / 1000).toInt()

            mediaRecorder?.apply {
                try {
                    stop()
                } catch (e: Exception) {
                    // Ignore if recording is too short
                }

                release()
            }

            mediaRecorder = null

            val map = WritableNativeMap()
            val path = audioFilePath

            if (path != null) {
                val file = File(path)

                map.putString("uri", "file://$path")
                map.putDouble("size", file.length().toDouble())
                map.putInt("duration", durationSecs)

                promise.resolve(map)
            } else {
                promise.reject("NO_FILE", "Audio file path is null")
            }

            audioFilePath = null

        } catch (e: Exception) {
            mediaRecorder?.release()
            mediaRecorder = null

            promise.reject("STOP_ERROR", e.message, e)
        }
    }

    // Cancel audio recording
    @ReactMethod
    fun cancelAudioRecording(promise: Promise) {
        try {
            mediaRecorder?.apply {
                try {
                    stop()
                } catch (e: Exception) {
                    // Ignore stop errors
                }

                release()
            }

            mediaRecorder = null

            audioFilePath?.let { path ->
                val file = File(path)

                if (file.exists()) {
                    file.delete()
                }
            }

            audioFilePath = null

            promise.resolve(true)

        } catch (e: Exception) {
            mediaRecorder?.release()
            mediaRecorder = null

            promise.resolve(false)
        }
    }

    override fun invalidate() {
        reactApplicationContext.removeActivityEventListener(
            activityEventListener
        )

        pendingPromise?.reject(
            "MODULE_DESTROYED",
            "Media picker module was destroyed"
        )

        pendingPromise = null
        pendingRequestCode = 0

        try {
            mediaRecorder?.release()
        } catch (e: Exception) {
            // Ignore cleanup errors
        }

        mediaRecorder = null

        super.invalidate()
    }
}
