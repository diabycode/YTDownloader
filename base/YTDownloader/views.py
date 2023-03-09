from django.http import HttpResponse, JsonResponse, FileResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from YTDownloader import app_utils
from YTDownloader import settings

import json
from pathlib import Path
import shutil

def home(request):
    if (settings.BASE_DIR/"files").exists():
        shutil.rmtree(path=str(settings.BASE_DIR/"files"))
    
    return render(request, "index.html", context={})


def download(request, video_id, itag):
    """ Download video and return a FileResponse
    """
    if (settings.BASE_DIR/"files").exists():
        shutil.rmtree(path=str(settings.BASE_DIR/"files"))
        
    output_path = settings.BASE_DIR / "files"

    base_url = 'https://www.youtube.com/watch?v='
    url = base_url + video_id
    object = app_utils.YouTube(url)
    stream = object.streams.get_by_itag(itag)

    print("downloading...")
    video_path = app_utils.download(video=object, stream=stream, output_path=str(output_path))

    # get dwnloaded video 
    with open(video_path, 'rb') as f:
        video_data = f.read()

    #  HTTP response 
    response = HttpResponse(video_data, content_type='video/mp4')
    response['Content-Disposition'] = f'attachment; filename="{stream.title}.mp4"'
 
    return response


def videofinder(request):
    """ Find video and return informations trough JsonResponse
    
        data: {
            title: ...
            desc: ...
            length: ...
            thumb_url: ...
        }
    """
    if (settings.BASE_DIR/"files").exists():
        shutil.rmtree(path=str(settings.BASE_DIR/"files"))

    body = json.loads(request.body)
    url = body.get("url")
    
    object = app_utils.YouTube(url)
    res_list = [
        {
            "mime_type":s.mime_type,
            "res": s.resolution,
            "itag": s.itag,
            "abr": s.abr,
        } for s in list(object.streams.filter(mime_type="video/mp4", type="video"))+\
        list(object.streams.filter(mime_type="audio/mp4", type="audio"))
    ]

    object_infos = {
        "title": object.title,
        "desc": object.description,
        "length": object.length,
        "thumb_url": object.thumbnail_url,
        "video_id": object.video_id,
        "res_list": res_list
    }

    response = JsonResponse(
        data=object_infos,
    )

    return response


