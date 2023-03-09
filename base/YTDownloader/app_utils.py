
from pytube import YouTube

import subprocess
from pathlib import Path

# unprogressive files merging ...
def merge_unprogressive_files(item1: str, item2: str, output_filename: str):

    command = (
        "ffmpeg",
        "-loglevel", "panic",
        "-y",
        "-i", item1,
        "-i", item2,
        "-c:v", "copy",
        "-c:a", "aac",
        "-strict", "experimental",
        output_filename
    )
    subprocess.run(command)

    return output_filename


def download(video, stream, output_path):
    if stream.is_progressive or stream.type == "audio":
        file = stream.download(output_path=output_path)
    else:
        # video
        video_file = stream.download(output_path=output_path,
                                     filename_prefix="video_")

        # audio
        audio_stream = video.streams.get_audio_only()
        audio_file = audio_stream.download(
            output_path=output_path,
            filename_prefix="audio_"
        )

        # merging
        filename = stream.title + "_" + stream.resolution + ".mp4"
        filename = filename.replace("|", "-")
        file = merge_unprogressive_files(
            video_file,
            audio_file,
            str(Path(output_path) / filename)
        ) 
    return file