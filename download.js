window.onload = () => {
    const storedImage = sessionStorage.getItem('mirroredImage');
    const resultHome = document.getElementById('homeBtn'); 

    if (storedImage) {
        const downloadBtn = document.getElementById('downloadBtn');

        downloadBtn.addEventListener('click', function() {
            const imageToDownload = sessionStorage.getItem('mirroredImage');
            
            if (imageToDownload) {
                // Create a download link for the image
                const downloadLink = document.createElement('a');
                downloadLink.href = imageToDownload;
                downloadLink.download = 'prettybooth.png';
                
                // Trigger Download
                downloadLink.click();
            } else {
                console.log('No image found in sessionStorage');
            }
        });
    }
    else {
        console.log('No image found in sessionStorage');
    }

    resultHome.addEventListener('click', (e) => {
        e.preventDefault()
        window.location.href = 'index.html'
    })
};
