
from django.urls import path
from .views import home, videofinder, download


urlpatterns = [
    path('', home, name="home"),
    path('videofinder/<str:video_id>', videofinder, name="videofinder"),
    path('download/<str:video_id>/<str:itag>/', download, name="download"),
    # path('admin/', admin.site.urls),
]
