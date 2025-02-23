const API_KEY = "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"; // Replace with your OpenAI API Key

document.addEventListener("DOMContentLoaded", function () {
    let searchButton = document.getElementById("search-button");
    let searchInput = document.getElementById("search");

    if (searchButton) {
        searchButton.addEventListener("click", handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                handleSearch();
            }
        });
    }

    displaySearchHistory();
});

// Function to ask AI
async function askAI() {
    let query = document.getElementById("search").value;
    let category = document.getElementById("category").value; // ✅ Get selected category
    let resultsDiv = document.getElementById("results");

    if (!query) {
        resultsDiv.innerHTML = "Please enter a question!";
        return;
    }

    saveSearchHistory(query, category); // ✅ Save search with category
    resultsDiv.innerHTML = "Thinking... 🤔";

    let prompt = `Category: ${category}. Question: ${query}`; // ✅ Format prompt with category

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 150,
            })
        });

        const data = await response.json();
        console.log(data); // ✅ Debugging: Show full API response

        if (data.error) {
            resultsDiv.innerHTML = `Error: ${data.error.message}`;
        } else if (data.choices && data.choices.length > 0) {
            let fullAnswer = data.choices[0].message.content;
            resultsDiv.innerHTML = fullAnswer;

            // Add Summarize Button
            let summarizeButton = document.createElement("button");
            summarizeButton.textContent = "Summarize";
            summarizeButton.id = "summarize-button";
            summarizeButton.style.marginTop = "10px";
            summarizeButton.addEventListener("click", function () {
                summarizeAnswer(fullAnswer);
            });

            resultsDiv.appendChild(document.createElement("br"));
            resultsDiv.appendChild(summarizeButton);
        } else {
            resultsDiv.innerHTML = "Sorry, I couldn't find an answer. 😕";
        }

        document.getElementById("search").value = ""; // ✅ Clears input after getting response

    } catch (error) {
        console.error("Error:", error);
        resultsDiv.innerHTML = "Oops! Something went wrong. 🚨 Check Console.";
    }
}

// Function to summarize the answer
async function summarizeAnswer(text) {
    let resultsDiv = document.getElementById("results");

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Summarize this in 3-8 words: ${text}` }],
                max_tokens: 20,
            })
        });

        const data = await response.json();
        console.log(data);

        if (data.choices && data.choices.length > 0) {
            let summaryText = document.getElementById("summary-text");

            if (!summaryText) {
                summaryText = document.createElement("p");
                summaryText.id = "summary-text";
                summaryText.style.fontWeight = "bold";
                summaryText.style.marginTop = "10px";
                resultsDiv.appendChild(summaryText);
            }

            summaryText.innerHTML = `Summary: ${data.choices[0].message.content}`;
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to save search history in localStorage
function saveSearchHistory(query, category) {
    if (!query) return; // Ignore empty searches

    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    // Avoid duplicate entries (move to top if it exists)
    searches = searches.filter(item => item.query !== query);
    searches.unshift({ query, category }); // ✅ Save category along with search

    // Limit to 5 searches
    if (searches.length > 5) {
        searches.pop();
    }

    localStorage.setItem("recentSearches", JSON.stringify(searches));

    console.log("Saved Searches:", searches); // Debugging
    displaySearchHistory(); // Update the UI
}

// Function to display search history
function displaySearchHistory() {
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    let searchList = document.getElementById("recent-searches");

    searchList.innerHTML = ""; // Clear previous list

    if (searches.length === 0) {
        searchList.innerHTML = "<li style='opacity: 0.6;'>No recent searches yet.</li>";
        return;
    }

    searches.forEach(({ query, category }) => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `<strong>[${category}]</strong> ${query}`; // ✅ Show category next to query

        // Clicking a past search should re-run it
        listItem.addEventListener("click", function () {
            document.getElementById("search").value = query;
            document.getElementById("category").value = category; // ✅ Set category when reloading search
            askAI(); // ✅ Call the correct function
        });

        searchList.appendChild(listItem);
    });

    console.log("Displayed Searches:", searches); // Debugging
}

// Function to handle searches
function handleSearch() {
    let query = document.getElementById("search").value.trim();
    let category = document.getElementById("category").value; // ✅ Get selected category
    if (query) {
        saveSearchHistory(query, category);
        askAI(); // ✅ Call the correct function
    }
}

// Function to clear search history
function clearSearchHistory() {
    localStorage.removeItem("recentSearches"); // ✅ Remove from storage
    displaySearchHistory(); // ✅ Update UI
}

// Attach event listener to the button
document.addEventListener("DOMContentLoaded", function () {
    let clearButton = document.getElementById("clear-searches");
    if (clearButton) {
        clearButton.addEventListener("click", clearSearchHistory);
    }
});
