const API_KEY = "mEeYrhUIhGfrgMaGc19gdlgvBWk3YDxa3k4Jqo3PgAPhsmp5";

async function fetchNews(page = 0) {
  const query = document.getElementById("searchInput").value;
  const container = document.getElementById("newsContainer");
  const spinner = document.getElementById("spinner");

  if (!query) {
    alert("Enter a search term");
    return;
  }

  spinner.classList.remove("hidden");
  container.innerHTML = "";

  try {
    const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(query)}&page=${page}&api-key=${API_KEY}`;

    console.log("Fetching:", url); // 👈 DEBUG

    const response = await fetch(url);
    const data = await response.json();

    console.log("Response:", data); // 👈 DEBUG

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    displayNews(data.response.docs);

  } catch (error) {
    console.error("FULL ERROR:", error);
    container.innerHTML = "<p>Error fetching news. Check console.</p>";
  }

  spinner.classList.add("hidden");
}

function displayNews(articles) {
  const container = document.getElementById("newsContainer");

  articles.forEach(article => {
    const card = document.createElement("div");
    card.classList.add("card");

    const headline = article.headline?.main || "No headline";
    const lead = article.lead_paragraph || article.snippet || "No description available.";
    const url = article.web_url;

    card.innerHTML = `
      <h3>${headline}</h3>
      <p>${lead}</p>
      <button onclick="window.open('${url}', '_blank')">
        Read More
      </button>
    `;

    container.appendChild(card);
  });
}