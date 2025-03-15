var zipJSUTL = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js';
var fileSaverURL = 'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min.js';

function loadLibrary(srcURL, callback) {
    var script = document.createElement("script");
    script.src = srcURL;
    script.onload = callback;
    document.head.appendChild(script);
}

// Ensure both JSZip and FileSaver.js are loaded before defining finish()
loadLibrary(zipJSUTL, function() {
    console.log("✅ JSZip Loaded");
    loadLibrary(fileSaverURL, function() {
        console.log("✅ FileSaver.js Loaded");
        initializeScript(); // Call main script after loading dependencies
    });
});

function initializeScript() {
    console.log("🚀 Script is initializing...");

    function findScrollableContainer() {
        let elements = document.querySelectorAll('*');
        let maxHeight = 0;
        let scrollableElement = null;

        elements.forEach(el => {
            if (el.scrollHeight > el.clientHeight) {
                let height = el.scrollHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                    scrollableElement = el;
                }
            }
        });

        return scrollableElement;
    }

    function addBlob(source, ind) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", source);
        xhr.responseType = "blob";
        xhr.onload = function() {
            if (blobs[ind] === undefined) {
                blobs[ind] = xhr.response;
            }
        };
        xhr.send();
    }

    var res = [];
    var blobs = [];
    var scrollBar = findScrollableContainer();

    if (scrollBar) {
        console.log("✅ Scrollable container found:", scrollBar);
        scrollBar.addEventListener('scroll', scrollFnc);
    } else {
        console.error("❌ Error: Could not find the scrollable book container.");
    }

    function scrollFnc() {
        let images = document.querySelectorAll('img');

        for (var i = 0; i < images.length; i++) {
            if (images[i].width > 500) {
                res.push(images[i]);

                var regex = new RegExp(/pg=\w\w\d+/i);
                let str = images[i].src;
                let x = str.match(regex);

                if (x == null) {
                    console.warn('⚠️ Skipped Image (Not a Page): ' + str);
                    continue;
                }

                let pageNo = x[0].substring(5) / 1;
                console.log("📖 Saving Page: " + pageNo);
                addBlob(str, pageNo);
            }
        }
    }

    // Define finish() after ensuring JSZip & FileSaver.js are loaded
    window.finish = function() {
        console.log("📦 Creating ZIP file...");
        var zip = new JSZip();

        for (var i = 0; i < blobs.length; i++) {
            if (blobs[i] === undefined) continue;
            zip.file('images/' + i + '.png', blobs[i], { base64: true });
        }

        zip.generateAsync({ type: "blob" }).then(function(content) {
            saveAs(content, "book.zip");
        });
    };

    console.log("✅ Script is ready. Scroll through the book, then type `finish()` in the console to download.");
}
