if(!RegExp.prototype.check){
    RegExp.prototype.check = function(o){
        return this.test(o) || this.test(o)
    }
}

function $(selector,context){
    return new $.fn.init(selector,context)
}

$.fn = $.prototype = {
    constructor:$,
    init:function(selector,context){
        var context = context || document
        if(/^\#/g.check(selector)){
            this[0] = context.querySelector(selector)
            this.length = 1
            this.method = "id"
        }else if(/^\./g.check(selector)){
            var args = context.querySelectorAll(selector)
            var len = args.length
            for(let i=0;i<len;i++){
                this[i] = args[i]
            }
            this.length = len
            this.method = "className"
        }else{
            var args = context.getElementsByTagName(selector)
            var len = args.length
            for(let i=0;i<len;i++){
                this[i] = args[i]
            }
            this.length = len
            this.method = "tagName"
        }
        this.context = context
        this.selector = selector
        return this
    },
    html:function(context){
        if(context){
            this[0].innerHTML = context
        }
        return this[0].innerHTML
    },
    text:function(){
        return this[0].innerText
    },
    addClass:function(newClassName){
        if(this.method === "id"){
            this[0].className = this[0].className + " " + newClassName
            return this
        }
        var len = this.length
        for(let i=0;i<len;i++){
            this[i].className = this[i].className + " " + newClassName
        }
        return this
    },
    removeClass:function(rmClassName){
        var reg = new RegExp(rmClassName,"g")
        if(this.method === "id"){
            this[0].className = this[0].className.replace(reg,"").trim()
            return this
        }
        var len = this.length
        for(let i=0;i<len;i++){
            this[i].className = this[i].className.replace(reg,"").trim()
        }
        return this
    },
    toggleClassName:function(newclassName){
        var reg = new RegExp(newclassName,"g")
        if(reg.check(this[0].className)){
            this.removeClass(newclassName)
        }else{
            this.addClass(newclassName)
        }
        return this
    },
    // 创建一个元素
    create:function(tagName,attr,context){
        var dom = document.createElement(tagName)
        var attr = attr || {}
        var context = context || ""
        // if(Object.keys(attr).length){
        //     for(let o in attr){
        //         dom.setAttribute(o,attr[o])
        //     }
        // }
        for(let o in attr){
            dom.setAttribute(o,attr[o])
        }
        dom.innerHTML = context
        return dom
    },
    // 把此元素添加到指定的父元素里边
    addpendTo:function(fadom){
        var fadom = fadom || document.body
        fadom.appendChild(this[0])
        return this
    },





    // 格式化字符串
    // 只能处理单个标签
    formateString:function(str,data){
        var html = ""
        if(data instanceof Array){
            for(let i=0,len=data.length;i<len;i++){
                html += this.formateString(str,data[i])
            }
            return html
        }else{
            return str.replace(/\{#([\w\W]+)#\}/g,function(match,key){
                var key = key.trim()
                return typeof data === "string" ? data : (typeof data[key] === "undefined" ? "" : data[key])
            })
        }
    },

    // 同步模块模式
    getOrSetPro: function(){
        var args = Array.prototype.slice.call(arguments)
        var obj = args[0]
        var router = args[1].replace(/^\./g,"").split(".")
        var value = args[2]
        var o = obj
        var len = router.length
        
        // 首先判断是赋值还是获取值
        if(value){
            // 说明是赋值
            for(let i=0;i<len;i++){
                if(o[router[i]]){
                    // 说明存在
                    if(i === len-1){
                        o[router[i]] = value
                    }else{
                        if(typeof o[router[i]] !== "object"){
                            throw new Error(`${router[i]} is not a object`)
                        }else{
                            o = o[router[i]]
                        }
                    }
                }else{
                    if(i === len-1){
                        o[router[i]] = value
                    }else{
                        // 说明不存在，就创建一个
                        o[router[i]] = {}
                        o = o[router[i]]
                    }
                }
            }
        }else{
            // 说明是获取值
            for(let i=0;i<len;i++){
                if(o[router[i]]){
                    // 说明存在
                    if(i === len-1){
                        return o[router[i]]
                    }
                    o = o[router[i]]
                }else{
                    // 说明不存在
                    return
                }
            }
        }

    },
    define: function(str,fn){

        this.getOrSetPro(this,str,fn)
        return this
    },
    module: function(){
        var getOrSetPro = this.getOrSetPro
        var args = Array.prototype.slice.call(arguments),
        fn = args.pop(),
        parts = args[0] && args[0] instanceof Array ? args[0] : args,
        m = [],
        that = this;
        for(let i=0,len=parts.length;i<len;i++){
            m.push(getOrSetPro(that,parts[i]))
        }
        fn.apply(null,m)
    },



    // ***************** satan 模板引擎 *********************
    documentModel:function(s,data,show){
        // 处理 * 功能，即重复功能
        var data = data || {}
        var container = this[0] || document.body
        // console.log(container)
        var show = show || false
        var that = this
        if(data instanceof Array){
            // 如果data是一个数组
            eachArray(data,function(index,value,len){
                container.appendChild(that.documentModel(s,value,false))
                // that.documentModel(s,value,false)
            })
            return this
        }
        var s = s.replace(/>([^>]+)\*(\w+)/g,function(){
            var args = Array.prototype.slice.call(arguments,1)
            args.pop()
            args.pop()
            var count = +args[1]
            var str = "+"+args[0]
            return ">" + str.repeat(count).replace(/^\+/g,"")
        })
        s = s.replace(/\s+(>)\s+/g,"$1")
        var sarr = s.split(">")
        for(let i=0,len=sarr.length;i<len;i++){
            sarr[i] = sarr[i].replace(/\s+(\+)\s+/g,"$1").split("+")
        }

        function eachArray(arr,fn){
            for(let i=0,len=arr.length;i<len;i++){
                fn(i,arr[i],len)
            }
        }
        var alldoms = []
        eachArray(sarr,function(index,value,len){
            var doms = []
            eachArray(value,function(index,value,len){
                var tagName = ""
                var id = ""
                var className = ""
                var attr = {}
                var text = ""
                value = value.replace(/@(\w+)/g,function(match,key){
                    if(data[key]){
                        return data[key]
                    }
                    throw new Error(`${key} is not find in data`)
                })
                value.replace(/^(\w+)([\.#]|\[)/g,function(match,key){
                    tagName = key
                })
                value.replace(/#([&\w\-]+)/g,function(){
                    var args = Array.prototype.slice.call(arguments,1)
                    args.pop()
                    args.pop()
                    id = args[0]
                    console.log(id)
                })
                value.replace(/^[\w\#\-]+\.([&\w\-]+)/g,function(match,key){
                    className = key
                })
                value.replace(/\{([\w\W]+)\}/g,function(match,key){
                    text = key.trim()
                })
                value.replace(/\[([\w\W]+)\]/g,function(match,key){
                    var a = key.split(/\s\s*/g)
                    eachArray(a,function(index,value,len){
                        var o = value.split("=")
                        var k = o[0]
                        var v = o[1].replace(/['']/g,"")
                        attr[k] = v
                    })
                })
                var dom = document.createElement(tagName)
                if(id){
                    dom.id = id
                }
                if(className){
                    dom.className = className
                }
                if(Object.keys(attr)){
                    for(let o in attr){
                        dom.setAttribute(o,attr[o])
                    }
                }
                // 使用 ##text## 的形式进行数据的模板渲染
                dom.innerHTML = text.replace(/&(\w+)&/g,function(match,key){
                    return data[key]
                })
                // console.log(text)
                // console.log(dom)
                doms.push(dom)
            })
            alldoms.push(doms)
        })
        function domModel(fadom,childsArr){
            for(let i=0,len=childsArr.length;i<len;i++){
                fadom.appendChild(childsArr[i])
            }
            return childsArr[childsArr.length-1]
        }
        if(show){
            var dom = domModel(container,alldoms[0])
        }else{
            var dom = alldoms[0][0]
        }
        var odom = dom
        for(let i=1,len=alldoms.length;i<len;i++){
            dom = domModel(dom,alldoms[i])
        }
        if(show){
            return this
        }else{
            return odom
        }
        // return odom
        // 不返回模板字符串形成的html模板，返回 this 可以继续进行链式操作

        // show
        // - true 添加到this[0]容器中，返回this，可以进行链式操作
        // - false ，返回 生成的html，因为不返回this，所以不可以进行链式操作`

    },



    // ajax请求
    ajax:(function(){
        var xhr = new XMLHttpRequest()
        return {
            get:function(url){
                var baseUrl = this.baseUrl
                return new Promise(function(resolve,reject){
                    // xhr.open 的第三个参数就是 是否开启异步
                    if(baseUrl){
                        xhr.open("get",baseUrl+url,true)
                    }else{
                        xhr.open("get",url,true)
                    }
                    xhr.send(null)
                    xhr.onload = function(){
                        try{
                            resolve(JSON.parse(xhr.response))
                        }catch(err){
                            resolve(xhr.response)
                        }
                    }
                })
            },
            post:function(url,data){
                var data = JSON.stringify(data)
                var baseUrl = this.baseUrl
                return new Promise(function(resolve,reject){
                    if(baseUrl){
                        xhr.open("post",baseUrl+url,true)
                    }else{
                        xhr.open("post",url,true)
                    }
                    xhr.send(data)
                    xhr.onload = function(){
                        try{
                            resolve(JSON.parse(xhr.response))
                        }catch(err){
                            resolve(xhr.response)
                        }
                    }
                })
            },
            setBaseUrl:function(burl){
                this.baseUrl = burl
            },
            baseUrl:null
        }
    })(),
}

$.fn.init.prototype = $.fn
