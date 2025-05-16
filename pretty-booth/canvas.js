document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const blackScreen = document.getElementById('blackScreen');
    const countdownText = document.getElementById('countdownText');
    const progressCounter = document.getElementById('progressCounter');
    const startBtn = document.getElementById('startBtn');
    const invertBtn = document.getElementById('invertBtn');
    // const downloadBtn = document.getElementById('downloadBtn');
    const doneBtn = document.getElementById('doneBtn');
    const flash = document.getElementById('flash');
    const photoContainer = document.getElementById('photoContainer');
    const canvas = document.createElement('canvas');
    let images = [];

    let invertBtnState = false;

    if(invertBtn) {
        invertBtn.addEventListener('click', () => {
            invertBtnState =!invertBtnState;
            // alert(invertBtnState)
            cameraInvertSwitch()
        });
    }

    function cameraInvertSwitch() {
        if (invertBtnState == true) {
            photoContainer.style.transform = 'scaleX(-1)'
            video.style.transform = 'scaleX(-1)'
        }
        else {
            photoContainer.style.transform = 'scaleX(1)'
            video.style.transform = 'scaleX(1)'
        }
    }

    if (window.location.pathname.endsWith("canvas.html") || window.location.pathname === "canvas.html") {
        function stopCameraStream() {
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop()); // Stop all tracks
                video.srcObject = null;
            }
        }

        
        function startCamera() {
            stopCameraStream(); 

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;

                    setTimeout(() => {
                        blackScreen.style.opacity = 0; 
                        setTimeout(() => blackScreen.style.display = 'none', 1000); 
                    }, 500);
                })
                .catch(err => console.error("Camera Access Denied", err));
        }

        startCamera();
    }

    async function startPhotobooth() {
        images = []; 
        photoContainer.innerHTML = ''; 
        progressCounter.textContent = "0/3"; 

        for (let i = 0; i < 3; i++) {
            await showCountdown(); 

            // Flash Effect
            flash.style.opacity = 1;
            setTimeout(() => flash.style.opacity = 0, 200);

            // Capture Image
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png');

            console.log("Captured Image: ", imageData);
            images.push(imageData);  
          
            const imgElement = document.createElement('img');
            imgElement.src = imageData;
            imgElement.classList.add('photo');
            photoContainer.appendChild(imgElement);

            progressCounter.textContent = `${i + 1}/3`;

            if (i < 2) await new Promise(res => setTimeout(res, 1000)); // Wait before next capture
        }

        if (images.length === 3) {
            doneBtn.style.display = 'block';
        }

        if (doneBtn) {
            doneBtn.addEventListener('click', (e) => {
                e.preventDefault()
                window.location.href = 'result.html'
            })
        }
    }

    async function showCountdown() {
        countdownText.style.display = "block";
        for (let countdown = 3; countdown > 0; countdown--) {
            countdownText.textContent = countdown;
            await new Promise(res => setTimeout(res, 1000));
        }
        countdownText.style.display = "none";
    }

    function downloadStackedImages() {
        const stackedCanvas = document.createElement('canvas');
        const ctx = stackedCanvas.getContext('2d');

        const canvasWidth = 592;
        const canvasHeight = 1352;

        const borderWidth = 40;  
        const spacing = 20;  
        const bottomPadding = 100; 

        const availableHeight = canvasHeight - (borderWidth * 2) - (spacing * 2) - bottomPadding;
        const photoHeight = availableHeight / 3; 
        const photoWidth = canvasWidth - (borderWidth * 2); 

        
        stackedCanvas.width = canvasWidth;
        stackedCanvas.height = canvasHeight;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, stackedCanvas.width, stackedCanvas.height);

        let loadedImages = 0;
        images.forEach((imgData, index) => {
            const img = new Image();
            img.src = imgData;
            img.onload = () => {
                const x = borderWidth;
                const y = borderWidth + (index * (photoHeight + spacing));

                if (invertBtnState === false) {
                    ctx.drawImage(img, x, y, photoWidth, photoHeight);
                }
                else {
                    ctx.save();
                    ctx.translate(x + photoWidth, y);
                    ctx.scale(-1, 1); 
                    ctx.drawImage(img, 0, 0, photoWidth, photoHeight);
                    ctx.restore();
                }

                loadedImages++;

                if (loadedImages === 3) { 
                    ctx.fillStyle = 'black';
                    ctx.font = 'bold 22px Arial, Roboto, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('pretty booth', stackedCanvas.width / 2, stackedCanvas.height - 75);

                    // Add date and time in smaller font
                    const currentDate = new Date();
                    const dateString = currentDate.toLocaleDateString();
                    // const timeString = currentDate.toLocaleTimeString();

                    ctx.font = '16px Arial, Roboto, sans-serif';
                    ctx.fillText(`${dateString}`, stackedCanvas.width / 2, stackedCanvas.height - 55);

                    const finalImage = stackedCanvas.toDataURL('image/png');

                    // Store the final image data in sessionStorage
                    sessionStorage.setItem('mirroredImage', finalImage);
                }
            };
        });
    }

    if(startBtn) {
        startBtn.addEventListener('click', () => startPhotobooth());
    }
    
    if (doneBtn) {
        doneBtn.addEventListener('click', () => downloadStackedImages());
    }
    
    // downloadBtn.addEventListener('click', () => downloadStackedImages());
})
