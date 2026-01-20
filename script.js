// 视频数据
const videos = [
    {
        id: 1,
        videoFile: "assets/videos/day_140.mp4",
        thumbnail: "thumbnails/day_140.png"
    },
    {
        id: 2,
        videoFile: "assets/videos/day_160_1.mp4",
        thumbnail: "thumbnails/day_160_1.png"
    },
    {
        id: 3,
        videoFile: "assets/videos/day_160_2.mp4",
        thumbnail: "thumbnails/day_160_2.png"
    },
    {
        id: 4,
        videoFile: "assets/videos/day_170.mp4",
        thumbnail: "thumbnails/day_170.png"
    },
    {
        id: 5,
        videoFile: "assets/videos/day_320.mp4",
        thumbnail: "thumbnails/day_320.png"
    }
];

// DOM元素
const videoGrid = document.getElementById('videoGrid');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const closeModalBtn = document.querySelector('.close-modal');
const videoCounter = document.getElementById('videoCounter');
const titleImage = document.getElementById('titleImage');

// 当前播放视频索引
let currentVideoIndex = 0;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log("MCART自适应视频站初始化");
    
    // 设置标题图片
    setupTitleImage();
    
    // 创建加载状态
    createLoadingState();
    
    // 延迟加载视频网格
    setTimeout(() => {
        loadVideoGrid();
        updateVideoCounter();
        
        // 初始化自适应布局
        setupResponsiveLayout();
    }, 500);
    
    // 设置模态框事件
    closeModalBtn.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // 键盘事件监听
    document.addEventListener('keydown', handleKeyboard);
    
    // 窗口大小改变时重新计算布局
    window.addEventListener('resize', debounce(handleResize, 150));
});

// 设置标题图片
function setupTitleImage() {
    if (!titleImage) return;
    
    // 设置标题图片加载处理
    titleImage.classList.add('loading-img');
    
    titleImage.onload = function() {
        console.log("✅ 标题图片加载成功");
        setTimeout(() => {
            titleImage.classList.remove('loading-img');
        }, 100);
    };
    
    titleImage.onerror = function() {
        console.warn("⚠️ 标题图片加载失败，使用默认样式");
        titleImage.classList.remove('loading-img');
        
        // 创建备用标题
        const titleContainer = titleImage.parentElement;
        if (titleContainer) {
            titleImage.style.display = 'none';
            const fallbackTitle = document.createElement('div');
            fallbackTitle.className = 'fallback-title';
            fallbackTitle.innerHTML = `
                <div class="title-text">MCART</div>
                <div class="subtitle">视觉作品集</div>
            `;
            titleContainer.appendChild(fallbackTitle);
        }
    };
}

// 设置响应式布局
function setupResponsiveLayout() {
    const container = document.querySelector('.adaptive-video-container');
    const grid = document.querySelector('.video-grid');
    
    if (!container || !grid) return;
    
    // 计算最优列数
    calculateOptimalColumns();
}

// 计算最优列数
function calculateOptimalColumns() {
    const containerWidth = window.innerWidth;
    let columns;
    
    if (containerWidth >= 1920) {
        columns = 4;
    } else if (containerWidth >= 1440) {
        columns = 3;
    } else if (containerWidth >= 1024) {
        columns = 3;
    } else if (containerWidth >= 768) {
        columns = 2;
    } else {
        columns = 1;
    }
    
    // 应用列数到CSS变量
    document.documentElement.style.setProperty('--grid-columns', columns);
    
    console.log(`屏幕宽度: ${containerWidth}px, 列数: ${columns}`);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 窗口大小改变处理
function handleResize() {
    calculateOptimalColumns();
    
    // 更新视频卡片样式
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
}

// 创建加载状态
function createLoadingState() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = '加载视频';
    document.body.appendChild(loading);
    
    // 加载完成后移除
    setTimeout(() => {
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.remove();
        }, 300);
    }, 800);
}

// 加载视频网格
function loadVideoGrid() {
    videoGrid.innerHTML = '';
    
    videos.forEach((video, index) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.style.setProperty('--item-index', index);
        
        videoItem.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="视频 ${index + 1}" loading="lazy" draggable="false">
                <div class="video-overlay"></div>
                <div class="play-indicator"></div>
            </div>
        `;
        
        videoItem.addEventListener('click', () => openVideoModal(video, index));
        videoGrid.appendChild(videoItem);
    });
    
    console.log(`✅ 加载了 ${videos.length} 个视频`);
}

// 打开视频模态框
function openVideoModal(video, index) {
    currentVideoIndex = index;
    modalVideo.src = video.videoFile;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // 更新计数器
    updateVideoCounter();
    
    // 尝试自动播放
    const playPromise = modalVideo.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            console.log('视频需要用户交互才能播放');
        });
    }
}

// 关闭视频模态框
function closeVideoModal() {
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = '';
}

// 更新视频计数器
function updateVideoCounter() {
    if (videoModal.style.display === 'flex') {
        videoCounter.textContent = `${currentVideoIndex + 1}/${videos.length}`;
    } else {
        videoCounter.textContent = `${videos.length}`;
    }
}

// 切换到下一个视频
function nextVideo() {
    if (currentVideoIndex < videos.length - 1) {
        currentVideoIndex++;
        openVideoModal(videos[currentVideoIndex], currentVideoIndex);
    }
}

// 切换到上一个视频
function prevVideo() {
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        openVideoModal(videos[currentVideoIndex], currentVideoIndex);
    }
}

// 处理键盘事件
function handleKeyboard(e) {
    // ESC键关闭模态框
    if (e.key === 'Escape' && videoModal.style.display === 'flex') {
        closeVideoModal();
    }
    
    // 左右箭头切换视频
    if (videoModal.style.display === 'flex') {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            nextVideo();
        }
        
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            prevVideo();
        }
        
        // 空格键播放/暂停
        if (e.key === ' ') {
            e.preventDefault();
            if (modalVideo.paused) {
                modalVideo.play();
            } else {
                modalVideo.pause();
            }
        }
    }
}

// 添加触摸滑动支持
let touchStartX = 0;
let touchEndX = 0;

videoModal.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

videoModal.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            prevVideo(); // 向右滑动，上一个视频
        } else {
            nextVideo(); // 向左滑动，下一个视频
        }
    }
}

// 防止拖拽图片
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// 监听视频播放状态
modalVideo.addEventListener('ended', function() {
    // 视频播放结束后自动播放下一个
    if (currentVideoIndex < videos.length - 1) {
        setTimeout(nextVideo, 1000);
    }

});


