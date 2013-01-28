# moasic
Image moasic generator in [node.js](http://nodejs.org).

## config

### required
**dims**: dimensions in pixels of each tile in the format ```"#x#"```.  
**grid**: number of pixels in the format ```"#x#"```.  
**src**: url or path to source image or video.  

### optional
**dir**: relative path of the directory containing images to use in the mosaic. Default is ```"images"```.  
**fps**: number of frames per second if the src is video. Default is ```6```.  
**save**: filename of final output. Default is ```"mosaic.jpg"```.  
**tint**: opacity of image on top of original pixel colour. Default is ```0.7```.  
**tmp**: relative path of temp directory, will be removed after process. Default is ```"tmp"```.