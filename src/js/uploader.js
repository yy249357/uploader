/*
* @Author: yankang
* @Date:   2017-07-17 11:13:36
* @Last Modified by:   yankang
* @Last Modified time: 2017-07-20 11:01:43
*/

'use strict';

;(function(window, document){
	var uploader = function(inputId, config){
		var uploaderBtn, imgSize, base64, viewWidth, viewHeight
		var config    = config || {}
		var uploader  = document.querySelector(inputId)
		var preview   = document.querySelector('.uploader__preview')
		var imgWidth  = config.imgWidth || "auto"
		var imgHeight = config.imgHeight || "auto"
		var formData  = new FormData()
		var defaultConfig = {
			imgWidth: 200,
			imgHeight: 200,
			limitSize: "40KB",
			url: '',
			success: function(res){
				console.log('上传成功!')
			},
			error: function(res){
				console.log('上传失败!')
			}
		}
		var imgAjax = function(data){
			var url = config.url
			var async = config.async
			var type = config.type
			var dataType = config.dataType
			var contentType = config.contentType
			var success = config.success
			var error = config.error
			async = async === false ? async : true
			type = type === "get" ? type : "post"
			dataType = config.dataType ? config.dataType : "text"
			contentType = config.contentType || "application/x-www-form-urlencoded"
			var xhr = new XMLHttpRequest()
			if(async === true){
			    xhr.onreadystatechange = function (){
			        if (xhr.readyState === 4){
			            if(xhr.status === 200){
			                config.success && config.success(xhr.responseText)
			            }
			            else{
			                config.error && config.error()
			            }
			        }
			    }
			}
			if(type === "POST" || type === "post"){
			    xhr.open(type, url + "?ran=" + Math.random(), async)
			    config.contentType && xhr.setRequestHeader("Content-type", contentType)
			    xhr.send(data)
			}
			else if(type === "GET" || type === "get"){
			    xhr.open(type, url + "?ran=" + Math.random() + data, async)
			    xhr.send()
			}
			if(async === false){
			    if (xhr.readyState === 4){
			        if(xhr.status === 200){
			            config.success && config.success(xhr.responseText)
			        }
			        else{
			            config.error && config.error()
			        }
			    }
			}
		}

		var base64ToBlob = function(urlData){
			//去掉url的头，并转换为byte
		    var bytes=window.atob(urlData.split(',')[1])
		    //处理异常,将ascii码小于0的转换为大于0
		    var ab = new ArrayBuffer(bytes.length)
		    var ia = new Uint8Array(ab)
		    for (var i = 0; i < bytes.length; i++) {
		        ia[i] = bytes.charCodeAt(i)
		    }
		    return new Blob( [ab] , {type : 'image/png'})
		}

		var extend = function(obj) {
            var newobj = JSON.parse(JSON.stringify(defaultConfig))
            for (var i in obj) {
                newobj[i] = obj[i]
            }
            return newobj
        }

        var imgCreate = function(img, file){
        	if(imgSize>parseInt(config.limitSize)){
        		alert('您上传的图片超过' + config.limitSize + ', 请重新上传')
        		return false
        	}
			var html = '<div class="uploader__info">'+
                    '<span style="margin-right: 40px">图片实际大小为'+ imgSize + 'KB(宽' + img.width + ' * 高' + img.height + ')</span>'+
                    '<span class="uploader__btn">上传</span>'+
                '</div>'
			var canvas = document.createElement('canvas')
			var ctx = canvas.getContext('2d')
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			canvas.width = img.width
			canvas.height = img.height
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
			base64 = canvas.toDataURL('image/png', 1)
			preview.innerHTML = html
			preview.insertBefore(img, preview.childNodes[0])
			whRatio(img)
			imgUpload(file)
        }

        var imgUpload = function(file){
        	uploaderBtn = document.querySelector('.uploader__btn')
        	formData.append("file", base64ToBlob(base64), file.name)
        	uploaderBtn.addEventListener('click', function(e){
        		imgAjax(formData)
        	}, false)
        }

        // 宽高比
        var whRatio = function(img){
        	var rate = img.width / img.height
        	var imgStyle = preview.querySelector('img').style
    		if(imgWidth === "auto" && imgHeight === "auto"){
    			imgStyle.width = imgHeight * rate + 'px'
    			imgStyle.height = imgWidth / rate + 'px'
    		}else if(imgWidth === "auto" && imgHeight !== "auto"){
    			imgStyle.width = imgHeight * rate + 'px'
    			imgStyle.height = imgHeight + 'px'
    		}else if(imgWidth !== "auto" && imgHeight === "auto"){
    			imgStyle.width = imgWidth + 'px'
    			imgStyle.height = imgWidth / rate + 'px'
    		}else{
    			imgStyle.width = imgWidth + 'px'
    			imgStyle.height = imgHeight + 'px'
    		}
        }

		uploader.parentNode.style.position = 'relative'

		uploader.addEventListener('change', function(e){
			config = extend(config)
			var file = e.target
			var files = !!file.files? file.files: []
			if(!files.length || !window.FileReader)return
			var reader = new FileReader()
			imgSize = (files[0].size/1024).toFixed(1)
			reader.readAsDataURL(files[0])
			reader.onload = function(e){
				var img = new Image()
				img.src = e.target.result
				img.onload = function() {
					imgCreate(img, files[0])
					return false
				}
			}
		}, false)
	}

	window.uploader = uploader
})(window, document, undefined)