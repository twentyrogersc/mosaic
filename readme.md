# moasic
Image moasic generator written in [node.js](http://nodejs.org).

## config
**dims** dimensions in pixels of each tile in the format ```#x#```  
**dir** relative path of the directory containing images to use in the mosaic  
**grid** number of pixels in the format ```#x#```  
**img** url or path to main image  
**save** relative path of directory to save assets to
**tint** opacity of image on top of original pixel colour 

## files created
The following files will be created in ```config.save```:  
**moasic.jpg** the moasic, in the size ```config.grid*config.dims```    
**pixels.jpg** the coloured pixel grid, for rederence  
**thumbs/*.jpg** images in the size specified by ```config.dims```  
**originals/*.jpg** cropped images in their largest size