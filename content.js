(function(){
    let hoverTimer=null;
    let windowStack=[]; /** רשימת כל החלונות למעבר Escape וסידור אוטומטי */

    document.querySelectorAll("a").forEach(link=>{
        link.addEventListener("mouseenter",()=>{hoverTimer=setTimeout(()=>{showIframe(link.href);},1500);});
        link.addEventListener("mouseleave",()=>{clearTimeout(hoverTimer);});
    });

    document.addEventListener("keydown",e=>{
        if(e.key==="Escape" && windowStack.length){
            const topWindow=windowStack[windowStack.length-1];
            topWindow.div.style.opacity="0";
            topWindow.div.style.transform="translate(-50%, -50%) scale(0.8)";
            setTimeout(()=>{topWindow.div.remove(); windowStack=windowStack.filter(w=>w.div!==topWindow.div);},300);
        }
    });

    function showIframe(url){
		let _position = 50;// + windowStack.length*20;
        /** div חדש לכל iframe */
        const previewBox=document.createElement("div");
        previewBox.style.position="fixed";
        previewBox.style.top=(_position)+"%";
        previewBox.style.left=(_position)+"%";
        previewBox.style.transform="translate(-50%, -50%) scale(0.8)";
        previewBox.style.width="500px";
        previewBox.style.height="500px";
        previewBox.style.background="white";
        previewBox.style.border="2px solid #444";
        previewBox.style.zIndex=(1000+windowStack.length);
        previewBox.style.boxShadow="0 4px 15px rgba(0,0,0,0.4)";
        previewBox.style.borderRadius="10px";
        previewBox.style.overflow="hidden";
        previewBox.style.opacity="0";
        previewBox.style.transition="all 0.3s ease";

        /** פס עליון לגרירה + כותרת + כפתורים */
        const header=document.createElement("div");
        header.style.height="30px";
        header.style.background="#f0f0f0";
        header.style.cursor="move";
        header.style.display="flex";
        header.style.alignItems="center";
        header.style.justifyContent="space-between";
        header.style.padding="0 10px";
        header.style.borderBottom="1px solid #ccc";

        /** כותרת ניתנת לעריכה / חיפוש */
        const titleSpan=document.createElement("input");
        titleSpan.type="text";
        titleSpan.value="טוען...";
        titleSpan.style.flex="1";
        titleSpan.style.fontSize="14px";
        titleSpan.style.fontWeight="bold";
        titleSpan.style.border="none";
        titleSpan.style.background="transparent";
        titleSpan.style.outline="none";
        titleSpan.style.overflow="hidden";
        titleSpan.style.whiteSpace="nowrap";
        titleSpan.style.textOverflow="ellipsis";
        titleSpan.addEventListener("keydown",e=>{
            if(e.key==="Enter") searchInIframe(previewBox.querySelector("iframe"), titleSpan.value);
        });

        /** כפתורים */
        const buttonsDiv=document.createElement("div");
        buttonsDiv.style.display="flex";
        buttonsDiv.style.alignItems="center";

        const buttonStyle={
            cursor:"pointer", fontSize:"16px", marginRight:"5px", transition:"color 0.2s ease"
        };

        /** כפתורים עם hover צבע */
        function makeBtn(icon,title,clickHandler){
            const btn=document.createElement("div");
            btn.innerHTML=icon;
            btn.title=title;
            Object.assign(btn.style,buttonStyle);
            btn.addEventListener("mouseenter",()=>{btn.style.color="#007bff";});
            btn.addEventListener("mouseleave",()=>{btn.style.color="#000";});
            btn.addEventListener("click",clickHandler);
            return btn;
        }

        /** פתיחה בטאב חדש */
        const openBtn=makeBtn("↗","פתח בטאב חדש",()=>{window.open(url,"_blank");});
        /** סגירה */
        const closeBtn=makeBtn("✕","סגור",()=>{previewBox.style.opacity="0"; previewBox.style.transform="translate(-50%, -50%) scale(0.8)"; setTimeout(()=>{previewBox.remove(); windowStack=windowStack.filter(w=>w.div!==previewBox);},300);});
        /** צמצום/הגדלה */
        const minimizeBtn=makeBtn("−","צמצם/הגדל",()=>{if(!minimized){originalHeight=previewBox.style.height; previewBox.style.height="30px"; minimizeBtn.innerHTML="+"; minimized=true;} else {previewBox.style.height=originalHeight; minimizeBtn.innerHTML="−"; minimized=false;}});
        let minimized=false,originalHeight="500px";
        /** פתיחה בדף הראשי */
        const openInPageBtn=makeBtn("🖥","פתח בדף הראשי",()=>{const iframeTag=previewBox.querySelector("iframe"); if(iframeTag && iframeTag.src) window.location.href=iframeTag.src;});
        /** רענון */
        const refreshBtn=makeBtn("⟳","רענן",()=>{const iframeTag=previewBox.querySelector("iframe"); if(iframeTag) iframeTag.src=iframeTag.src;});
        /** קדימה */
        const forwardBtn=makeBtn("→","קדימה",()=>{const iframeTag=previewBox.querySelector("iframe"); if(iframeTag) iframeTag.contentWindow.history.forward();});
        /** אחורה */
        const backBtn=makeBtn("←","אחורה",()=>{const iframeTag=previewBox.querySelector("iframe"); if(iframeTag) iframeTag.contentWindow.history.back();});
        /** full screen עם שחזור */
        const fullBtn=makeBtn("⛶","מסך מלא",()=>{
            if(!isFull){
                previewBox.dataset.prevWidth = previewBox.style.width;
                previewBox.dataset.prevHeight = previewBox.style.height;
                previewBox.dataset.prevTop = previewBox.style.top;
                previewBox.dataset.prevLeft = previewBox.style.left;
                previewBox.style.width="100%";
                previewBox.style.height="100%";
                previewBox.style.top="0";
                previewBox.style.left="0";
                previewBox.style.transform="translate(0,0) scale(1)";
                isFull=true;
            } else {
                previewBox.style.width = previewBox.dataset.prevWidth;
                previewBox.style.height = previewBox.dataset.prevHeight;
                previewBox.style.top = previewBox.dataset.prevTop;
                previewBox.style.left = previewBox.dataset.prevLeft;
                previewBox.style.transform="translate(-50%, -50%) scale(1)";
                isFull=false;
            }
        });  
        let isFull=false;

        /** copy URL */
        const copyBtn=makeBtn("📋","העתק URL",()=>{const iframeTag=previewBox.querySelector("iframe"); if(iframeTag) navigator.clipboard.writeText(iframeTag.src);});

        buttonsDiv.appendChild(copyBtn);
        buttonsDiv.appendChild(fullBtn);
        /*buttonsDiv.appendChild(backBtn);*/
        /*buttonsDiv.appendChild(forwardBtn);*/
        buttonsDiv.appendChild(refreshBtn);
        buttonsDiv.appendChild(openBtn);
        buttonsDiv.appendChild(openInPageBtn);
        buttonsDiv.appendChild(minimizeBtn);
        buttonsDiv.appendChild(closeBtn);

        header.appendChild(titleSpan);
        header.appendChild(buttonsDiv);

        /** iframe */
        const iframe=document.createElement("iframe");
        iframe.src=url;
        iframe.style.width="100%";
        iframe.style.height="calc(100% - 30px)";
        iframe.style.border="none";

        /** ידית לשינוי גודל */
        const resizer=document.createElement("div");
        resizer.style.width="15px";
        resizer.style.height="15px";
        resizer.style.position="absolute";
        resizer.style.right="0";
        resizer.style.bottom="0";
        resizer.style.cursor="se-resize";
        resizer.style.background="transparent";

        previewBox.appendChild(header);
        previewBox.appendChild(iframe);
        previewBox.appendChild(resizer);
        document.body.appendChild(previewBox);

        /** אנימציה פתיחה */
        setTimeout(()=>{previewBox.style.opacity="1"; previewBox.style.transform="translate(-50%, -50%) scale(1)";},10);

        /** גרירה ושינוי גודל */
        makeDraggable(previewBox,header);
        makeResizable(previewBox,resizer,iframe);

        /** עדכון כותרת */
        iframe.addEventListener("load",()=>{try{titleSpan.value=iframe.contentDocument.title||"ללא כותרת";}catch(e){titleSpan.value="ללא כותרת";}});

        /** הוספה לסטאק */
        windowStack.push({div:previewBox});
    }

    function makeDraggable(element,handle){
        let offsetX=0,offsetY=0,isDown=false;
        handle.addEventListener("mousedown",(e)=>{isDown=true; offsetX=e.clientX-element.getBoundingClientRect().left; offsetY=e.clientY-element.getBoundingClientRect().top; document.body.style.userSelect="none"; element.style.transition="none";});
        document.addEventListener("mouseup",()=>{if(isDown) element.style.transition="all 0.3s ease"; isDown=false; document.body.style.userSelect="auto";});
        document.addEventListener("mousemove",(e)=>{if(!isDown) return; element.style.top=e.clientY-offsetY+"px"; element.style.left=e.clientX-offsetX+"px"; element.style.transform="translate(0,0) scale(1)";});
    }

    function makeResizable(element,resizer,iframe){
        let isResizing=false;
        resizer.addEventListener("mousedown",(e)=>{isResizing=true; document.body.style.userSelect="none"; element.style.transition="none"; e.preventDefault();});
        document.addEventListener("mousemove",(e)=>{if(!isResizing) return; const rect=element.getBoundingClientRect(); let newWidth=e.clientX-rect.left; let newHeight=e.clientY-rect.top; if(newWidth>200) element.style.width=newWidth+"px"; if(newHeight>150) element.style.height=newHeight+"px"; iframe.style.height="calc(100% - 30px)";});
        document.addEventListener("mouseup",()=>{if(isResizing) element.style.transition="all 0.3s ease"; isResizing=false; document.body.style.userSelect="auto";});
    }

    function searchInIframe(iframe,text){
        try{
            const body=iframe.contentDocument.body;
            if(!body) return;
            const found=body.innerHTML.includes(text);
            alert(found ? "נמצא" : "לא נמצא");
        }catch(e){alert("חיפוש לא זמין (CORS)");}
    }
})();
