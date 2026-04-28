const API_KEY = "API key 1"; 

async function searchVideos() {
    const query = document.getElementById("searchInput").value;

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=5&type=video&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    displayVideos(data.items);
}

function displayVideos(videos) {
    const videoContainer = document.getElementById("videos");

    videoContainer.innerHTML = videos.map(video => {
        const videoId = video.id.videoId;
        const thumbnail = video.snippet.thumbnails.medium.url;

        
        return `
            <img src="${thumbnail}" onclick="playVideo('${videoId}')">
        `;
    }).join("");
}

function playVideo(videoId) {
    const player = document.getElementById("player");

    player.src = `https://www.youtube.com/embed/${videoId}`;
}