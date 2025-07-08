class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('imageCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentImage = null;
        this.aspectRatio = 1;
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.editorSection = document.getElementById('editorSection');
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.aspectRatioSelect = document.getElementById('aspectRatio');
        this.qualityInput = document.getElementById('qualityInput');
        this.qualityValue = document.getElementById('qualityValue');
        this.resizeBtn = document.getElementById('resizeBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    setupEventListeners() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.imageInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Control events
        this.widthInput.addEventListener('input', this.handleWidthChange.bind(this));
        this.heightInput.addEventListener('input', this.handleHeightChange.bind(this));
        this.aspectRatioSelect.addEventListener('change', this.handleAspectRatioChange.bind(this));
        this.qualityInput.addEventListener('input', this.handleQualityChange.bind(this));

        // Button events
        this.resizeBtn.addEventListener('click', this.resizeImage.bind(this));
        this.resetBtn.addEventListener('click', this.resetImage.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadImage.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Sila pilih fail imej sahaja!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.displayImage();
                this.editorSection.style.display = 'block';
                this.uploadArea.style.display = 'none';
                
                // Set initial dimensions
                this.widthInput.value = img.width;
                this.heightInput.value = img.height;
                this.aspectRatio = img.width / img.height;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayImage() {
        if (!this.currentImage) return;

        const maxWidth = 600;
        const maxHeight = 400;
        
        let displayWidth = this.currentImage.width;
        let displayHeight = this.currentImage.height;

        // Scale down if too large
        if (displayWidth > maxWidth || displayHeight > maxHeight) {
            const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
            displayWidth *= ratio;
            displayHeight *= ratio;
        }

        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.currentImage, 0, 0, displayWidth, displayHeight);
    }

    handleWidthChange() {
        if (this.aspectRatioSelect.value !== 'free') {
            const width = parseInt(this.widthInput.value) || 0;
            const height = Math.round(width / this.aspectRatio);
            this.heightInput.value = height;
        }
    }

    handleHeightChange() {
        if (this.aspectRatioSelect.value !== 'free') {
            const height = parseInt(this.heightInput.value) || 0;
            const width = Math.round(height * this.aspectRatio);
            this.widthInput.value = width;
        }
    }

    handleAspectRatioChange() {
        const ratio = this.aspectRatioSelect.value;
        
        switch (ratio) {
            case '1:1':
                this.aspectRatio = 1;
                break;
            case '16:9':
                this.aspectRatio = 16/9;
                break;
            case '4:3':
                this.aspectRatio = 4/3;
                break;
            case '3:4':
                this.aspectRatio = 3/4;
                break;
            case 'free':
                this.aspectRatio = this.originalImage.width / this.originalImage.height;
                break;
        }

        // Update height based on current width
        const width = parseInt(this.widthInput.value) || this.originalImage.width;
        const height = Math.round(width / this.aspectRatio);
        this.heightInput.value = height;
    }

    handleQualityChange() {
        this.qualityValue.textContent = this.qualityInput.value + '%';
    }

    resizeImage() {
        if (!this.originalImage) return;

        const newWidth = parseInt(this.widthInput.value);
        const newHeight = parseInt(this.heightInput.value);

        if (newWidth <= 0 || newHeight <= 0) {
            alert('Sila masukkan saiz yang sah!');
            return;
        }

        // Create temporary canvas for resizing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        // Use high quality image smoothing
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';

        // Draw resized image
        tempCtx.drawImage(this.originalImage, 0, 0, newWidth, newHeight);

        // Create new image from canvas
        const resizedImage = new Image();
        resizedImage.onload = () => {
            this.currentImage = resizedImage;
            this.displayImage();
            this.showMessage('Imej berjaya diubah saiz!', 'success');
        };
        resizedImage.src = tempCanvas.toDataURL('image/jpeg', this.qualityInput.value / 100);
    }

    resetImage() {
        if (!this.originalImage) return;

        this.currentImage = this.originalImage;
        this.widthInput.value = this.originalImage.width;
        this.heightInput.value = this.originalImage.height;
        this.aspectRatio = this.originalImage.width / this.originalImage.height;
        this.aspectRatioSelect.value = 'free';
        this.qualityInput.value = 90;
        this.qualityValue.textContent = '90%';
        
        this.displayImage();
        this.showMessage('Imej telah direset!', 'info');
    }

    downloadImage() {
        if (!this.currentImage) {
            alert('Tiada imej untuk dimuat turun!');
            return;
        }

        // Create canvas for download
        const downloadCanvas = document.createElement('canvas');
        const downloadCtx = downloadCanvas.getContext('2d');
        
        downloadCanvas.width = this.currentImage.width;
        downloadCanvas.height = this.currentImage.height;
        
        downloadCtx.drawImage(this.currentImage, 0, 0);

        // Create download link
        const link = document.createElement('a');
        link.download = `edited-image-${Date.now()}.jpg`;
        link.href = downloadCanvas.toDataURL('image/jpeg', this.qualityInput.value / 100);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('Imej berjaya dimuat turun!', 'success');
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                messageDiv.style.background = '#28a745';
                break;
            case 'error':
                messageDiv.style.background = '#dc3545';
                break;
            default:
                messageDiv.style.background = '#17a2b8';
        }

        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the image editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageEditor();
}); 