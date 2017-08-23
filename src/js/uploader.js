/*
* @Author: yankang
* @Date:   2017-07-17 11:13:36
* @Last Modified by:   yankang
* @Last Modified time: 2017-08-23 13:30:06
*/

'use strict';

;(function(window, document){
	var uploader = function(inputDom, config){
		var uploaderBtn, emptyBtn, imgSize, base64=[], viewWidth, viewHeight
		var uploader=[], preview=[], domName
		var config    = config || {}
		var imgWidth  = config.imgWidth || "auto"
		var imgHeight = config.imgHeight || "auto"
		var defaultConfig = {
			imgWidth: 200,
			imgHeight: 200,
			url: '',
			success: function(res, target, idx){
				console.log('上传成功!')
			},
			error: function(res, target, idx){
				console.log('上传失败!')
			}
		}
		var imgAjax = function(data, target){
			var url = config.url
			var async = config.async
			var type = config.type
			var dataType = config.dataType
			var contentType = config.contentType
			var success = config.success
			var error = config.error
			var idx = target.getAttribute('index')
			async = async === false ? async : true
			type = type === "get" ? type : "post"
			dataType = config.dataType ? config.dataType : "text"
			contentType = config.contentType || "application/x-www-form-urlencoded"
			var xhr = new XMLHttpRequest()
			if(async === true){
			    xhr.onreadystatechange = function (){
			        if (xhr.readyState === 4){
			            if(xhr.status === 200){
			                config.success && config.success(xhr.responseText, target, idx)
			            }
			            else{
			                config.error && config.error(xhr.responseText, target, idx)
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
			            config.success && config.success(xhr.responseText, target, idx)
			        }
			        else{
			            config.error && config.error(xhr.responseText, target, idx)
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

        var imgCreate = function(img, file, index){
        	if(config.limitWidth && img.width != parseInt(config.limitWidth)){
        		alert('您上传的图片宽度不等于' + config.limitWidth + ', 请重新上传')
        		return false
        	}
        	if(config.limitHeight && img.height != parseInt(config.limitHeight)){
        		alert('您上传的图片高度不等于' + config.limitHeight + ', 请重新上传')
        		return false
        	}
        	if(config.limitSize && imgSize>parseInt(config.limitSize)){
        		alert('您上传的图片超过' + config.limitSize + ', 请重新上传')
        		return false
        	}
			var html = '<div class="uploader__info">'+
                    '<span style="margin-right: 40px">图片实际大小为'+ imgSize + 'KB(宽' + img.width + ' * 高' + img.height + ')</span>'+
                    '<span class="' + domName + index + 'Btn uploader__btn" index="' + index + '">上传</span>'+
                    '<span class="'+ domName + index + 'emptyBtn empty__btn">清空</span>'
                '</div>'
			var canvas = document.createElement('canvas')
			var ctx = canvas.getContext('2d')
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			canvas.width = img.width
			canvas.height = img.height
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
			base64[index] = canvas.toDataURL('image/png', 1)
			preview[index].innerHTML = html
			preview[index].insertBefore(img, preview[index].childNodes[0])
			whRatio(img, index)
			imgUpload(file, index)
        }

        var imgUpload = function(file, index){
        	uploaderBtn = document.querySelector('.' + domName + index + 'Btn')
        	emptyBtn = document.querySelector('.' + domName + index + 'emptyBtn')

        	uploaderBtn.addEventListener('click', function(e){
        		var formData  = new FormData()
        		formData.append("file", base64ToBlob(base64[index]), file.name)
        		imgAjax(formData, e.target)
        	}, false)
        	emptyBtn.addEventListener('click', function(e){
        		preview[index].innerHTML = ''
        	}, false)
        }

        // 宽高比
        var whRatio = function(img, index){
        	var rate = img.width / img.height
        	var imgStyle = preview[index].querySelector('img').style
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

        uploader = document.querySelectorAll(inputDom)
        domName = inputDom.indexOf('#')!=-1? inputDom.split('#')[1]: inputDom.split('.')[1]
        if(uploader.length){
        	for(var i=0; i<uploader.length; ++i){
    			preview[i] = document.querySelector('.' + domName + i + '__preview')
    			uploader[i].parentNode.style.position = 'relative'
        		;(function(i){
        			uploader[i].addEventListener('change', function(e){
        				if(e && e.preventDefault) {
        				    e.preventDefault();
        				}else{
        				    event.returnValue = false
        				}
        				config = extend(config)
        				var e = e || window.event
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
        						imgCreate(img, files[0], i)
        						uploader[i].value = ''
        						return false
        					}
        				}
        			}, false)
        		})(i)
        	}
        }
	}

	window.uploader = uploader
})(window, document, undefined)