
/* HYDRIX — Water Scarcity Atlas */

document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById("dryZoneMap");
  if (!mapElement || typeof L === "undefined") return;

  const towns = [
    {
      name: "Monywa",
      region: "Sagaing",
      lat: 22.1086,
      lng: 95.1358,
      target: "townMonywa",
      needs: "Household water, farming and irrigation",
      challenge: "Seasonal rainfall and reliable water access"
    },
    {
      name: "Shwebo",
      region: "Sagaing",
      lat: 22.5693,
      lng: 95.6982,
      target: "townShwebo",
      needs: "Crop cultivation and irrigation",
      challenge: "Delayed rainfall and soil moisture loss"
    },
    {
      name: "Salingyi",
      region: "Sagaing",
      lat: 21.9731,
      lng: 95.0819,
      target: "townSalingyi",
      needs: "Household and agricultural supplies",
      challenge: "Water storage and safe drinking water"
    },

    {
      name: "Myingyan",
      region: "Mandalay",
      lat: 21.4600,
      lng: 95.3900,
      target: "townMyingyan",
      needs: "Farming, livestock and household water",
      challenge: "Irregular rainfall and irrigation efficiency"
    },
    {
      name: "Nyaung-U",
      region: "Mandalay",
      lat: 21.2006,
      lng: 94.9083,
      target: "townNyaungu",
      needs: "Households, businesses and public services",
      challenge: "Seasonal demand and storage capacity"
    },
    {
      name: "Kyaukpadaung",
      region: "Mandalay",
      lat: 20.8416,
      lng: 95.1267,
      target: "townKyaukpadaung",
      needs: "Farming, livestock and household water",
      challenge: "Seasonal rainfall and storage"
    },

    {
      name: "Pakokku",
      region: "Magway",
      lat: 21.3349,
      lng: 95.0844,
      target: "townPakokku",
      needs: "Household water, irrigation and businesses",
      challenge: "Reliable supply and drinking-water quality"
    },
    {
      name: "Chauk",
      region: "Magway",
      lat: 20.8992,
      lng: 94.8178,
      target: "townChauk",
      needs: "Households, workplaces and farming",
      challenge: "Long dry spells and water storage"
    },
    {
      name: "Magway",
      region: "Magway",
      lat: 20.1496,
      lng: 94.9325,
      target: "townMagway",
      needs: "Homes, schools, hospitals and businesses",
      challenge: "Urban water demand and distribution"
    }
  ];

  const map = L.map("dryZoneMap", {
    scrollWheelZoom: false,
    zoomControl: true
  });

  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ).addTo(map);

  const townList = document.getElementById("atlasTownList");
  const count = document.getElementById("atlasCount");
  const filters = document.querySelectorAll(".dz-atlas-filter");
  const markerGroup = L.layerGroup().addTo(map);

  let currentRegion = "all";
  let activeTown = null;

  const markers = new Map();

  function openTownProfile(town) {
    const profile = document.getElementById(town.target);
    if (!profile) return;

    // Open the matching Bootstrap accordion.
    if (window.bootstrap) {
      bootstrap.Collapse.getOrCreateInstance(profile, {
        toggle: false
      }).show();
    }

    // Scroll to the corresponding town information.
    setTimeout(() => {
      profile.closest(".accordion-item")
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
    }, 200);
  }

  function createPopup(town) {
    return `
      <div class="dz-atlas-popup">
        <small>${town.region.toUpperCase()} REGION</small>
        <h3>${town.name}</h3>

        <p><strong>Water needs:</strong><br>
          ${town.needs}</p>

        <p><strong>Possible challenges:</strong><br>
          ${town.challenge}</p>

        <a href="#${town.target}"
           class="dz-atlas-profile-link"
           data-target="${town.target}">
          READ TOWN PROFILE ↗
        </a>
      </div>
    `;
  }

  towns.forEach(town => {
    const marker = L.circleMarker(
      [town.lat, town.lng],
      {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: "#315f91",
        fillOpacity: 1
      }
    );

    marker.bindPopup(createPopup(town), {
      maxWidth: 260
    });

    marker.on("click", () => {
      activeTown = town.name;
      updateActiveTown();
    });

    marker.on("popupopen", event => {
      const popup = event.popup.getElement();
      const link = popup?.querySelector(
        ".dz-atlas-profile-link"
      );

      if (link) {
        link.addEventListener("click", e => {
          e.preventDefault();
          openTownProfile(town);
        });
      }
    });

    markers.set(town.name, marker);
  });

  function updateActiveTown() {
    townList.querySelectorAll(".dz-atlas-town")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.town === activeTown
        );
      });
  }

  function selectTown(town) {
    activeTown = town.name;
    updateActiveTown();

    map.flyTo([town.lat, town.lng], 10, {
      duration: 0.65
    });

    const marker = markers.get(town.name);
    if (marker) marker.openPopup();
  }

  function setRegion(region) {
    currentRegion = region;
    activeTown = null;

    const visibleTowns = towns.filter(town =>
      region === "all" || town.region === region
    );

    markerGroup.clearLayers();
    townList.replaceChildren();

    visibleTowns.forEach(town => {
      const marker = markers.get(town.name);
      marker.addTo(markerGroup);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "dz-atlas-town";
      button.dataset.town = town.name;

      const name = document.createElement("span");
      name.textContent = town.name;

      const regionLabel = document.createElement("small");
      regionLabel.textContent = town.region;

      button.append(name, regionLabel);

      button.addEventListener("click", () => {
        selectTown(town);
      });

      townList.append(button);
    });

    count.textContent =
      String(visibleTowns.length).padStart(2, "0");

    filters.forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.region === region
      );
    });

    if (visibleTowns.length > 0) {
      const bounds = L.latLngBounds(
        visibleTowns.map(town => [town.lat, town.lng])
      );

      map.fitBounds(bounds.pad(0.25), {
        maxZoom: 9
      });
    }
  }

  filters.forEach(button => {
    button.addEventListener("click", () => {
      setRegion(button.dataset.region);
    });
  });

  setRegion("all");

  // Refresh map size after initial layout.
  requestAnimationFrame(() => map.invalidateSize());
});
