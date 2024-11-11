document.addEventListener("DOMContentLoaded", async () => {
  const kitchen = document.getElementById("kitchen");
  const tooltip = document.getElementById("tooltip");
  const cuisineSuggestion = document.getElementById("cuisine-suggestion");
  const filterSelect = document.getElementById("filter");

  const API_BASE_URL = "https://susu-meal-prep.onrender.com";

  const customImages = {
    "Tomato": "images/tomato.png",
    "Lettuce": "images/lettuce.png",
    "Mushroom": "images/mushroom.png",
    "Bell Pepper": "images/pepper.png",
    "Natto": "images/natto.png"
  };

  const spawnPositions = {
    "Tomato": { left: "30%", top: "20%" },
    "Lettuce": { left: "32%", top: "55%" },
    "Mushroom": { left: "35%", top: "1%" },
    "Bell Pepper": { left: "40%", top: "30%" },
    "Natto": { left: "40%", top: "40%" }
  };

  const foodItems = {};

  // Fetch details for a specific food item
  async function fetchFoodDetails(itemName) {
    try {
      const response = await fetch(`${API_BASE_URL}/meal-prep/${itemName}`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error(`Error fetching data for ${itemName}:`, error);
      return null;
    }
  }

  // Fetch cuisine suggestion for a specific food item
  async function fetchCuisineDetails(itemName) {
    try {
      const response = await fetch(`${API_BASE_URL}/cuisine/${itemName}`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error(`Error fetching cuisine data for ${itemName}:`, error);
      return null;
    }
  }

  // Load food items, set positions, add tooltips, and enable highlighting
  async function loadFoodItems() {
    const items = Object.keys(customImages);
    for (const itemName of items) {
      const itemData = await fetchFoodDetails(itemName);

      if (itemData) {
        const foodItem = document.createElement("div");
        foodItem.classList.add("food-item");

        const position = spawnPositions[itemName];
        foodItem.style.left = position.left;
        foodItem.style.top = position.top;
        foodItem.style.position = "absolute";

        const img = document.createElement("img");
        img.src = customImages[itemName];
        img.alt = itemName;

        foodItem.appendChild(img);
        kitchen.appendChild(foodItem);

        foodItems[itemName] = { element: foodItem, data: itemData };

        // Show tooltip with item information
        foodItem.addEventListener("mouseenter", () => {
          tooltip.style.display = "block";
          tooltip.innerHTML = `
            <strong>${itemName}</strong><br>
            <em>Description:</em> ${itemData.description || "No description available"}<br>
            <em>Storage:</em> ${itemData.meal_prep_solution || "No meal prep solution available"}<br>
            <em>Tip:</em> ${itemData.tip ? itemData.tip[0] : "No tips available"}<br>
            <em>Random Fact:</em> ${itemData.random_fact || "No random fact available"}
          `;
        });

        foodItem.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });

        // Toggle selection and show cuisine suggestion
        foodItem.addEventListener("click", async () => {
          const isSelected = foodItem.classList.contains("highlighted");
          document.querySelectorAll(".food-item").forEach(item => item.classList.remove("highlighted"));

          if (!isSelected) {
            foodItem.classList.add("highlighted");

            const cuisineData = await fetchCuisineDetails(itemName);
            if (cuisineData && cuisineData.cuisine) {
              cuisineSuggestion.innerHTML = `
                <h3>Suggested Recipe: ${cuisineData.cuisine.name}</h3>
                <p><strong>Cuisine:</strong> ${cuisineData.cuisine.origin}</p>
                <img src="${cuisineData.cuisine.image}" alt="${cuisineData.cuisine.name}">
              `;
              cuisineSuggestion.style.display = "block";
            } else {
              cuisineSuggestion.innerHTML = `<p>No cuisine information available for ${itemName}.</p>`;
              cuisineSuggestion.style.display = "block";
            }
          } else {
            cuisineSuggestion.innerHTML = "";
            cuisineSuggestion.style.display = "none";
          }
        });
      }
    }
  }

  // Filter items based on storage time
  function filterItems() {
    const selectedFilter = filterSelect.value;

    Object.keys(foodItems).forEach(itemName => {
      const item = foodItems[itemName];
      const storageTime = item.data.storage_time;

      if (selectedFilter === "all" || storageTime === selectedFilter) {
        item.element.classList.remove("grayed-out");
      } else {
        item.element.classList.add("grayed-out");
      }
    });
  }

  filterSelect.addEventListener("change", filterItems);

  // Move tooltip to follow the cursor
  kitchen.addEventListener("mousemove", (event) => {
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
  });

  await loadFoodItems();
  filterItems();
});
