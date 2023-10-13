async function getPage(route) {
  const data = await fetch(route);
  const text = await data.text();
  const parser = new DOMParser();

  if (data.status === 404) {
    throw new Error(`404 Response when fetching ${route}`);
  }

  const html = parser.parseFromString(text, "text/html");

  const nameElem = html.querySelector("#name");
  const sloganElem = html.querySelector("#slogan");
  const socialElems = html.querySelectorAll(".social");
  const imageElem = html.querySelector("#image");

  return {
    name: nameElem ? nameElem.textContent : "",
    slogan: sloganElem ? sloganElem.textContent : "",
    social: socialElems
      ? Array.from(socialElems).map((e) => {
          return {
            name: e.dataset.name ? e.dataset.name : e.href,
            href: e.href,
          };
        })
      : [],
    image: imageElem && imageElem.src ? imageElem.src : "",
  };
}

async function getRoutes() {
  const data = await fetch("./routes.txt");
  const text = await data.text();
  const urls = text.split("\n");

  const routes = [];

  for (const url of urls) {
    try {
      const info = await getPage(url);

      routes.push({
        ...info,
        url,
      });
    } catch (err) {
      console.error(err);
    }
  }

  return routes;
}

async function loadInfo() {
  const pagesElem = document.querySelector(".pages");
  const routes = await getRoutes();

  for (const route of routes) {
    pagesElem.innerHTML += `
      <div class="w-full grid grid-cols-2 my-10 p-5 gap-5 rounded-lg bg-slate-50">
        <img class="w-60 h-60 object-cover m-auto rounded-lg" src="${
          route.image
        }" />
        <div>
          <h2 class="text-xl font-bold underline">
            <a href="${route.url}">${route.name}</a>
          </h2>
          <p>${route.slogan}</p>
          <ul>
          ${route.social
            .map((e) => {
              return `
              <li>
                <a class="font-bold text-blue-500 underline" href="${e.href}" target="_blank">${e.name}</a>
              </li>
              `;
            })
            .join("")}
          </ul>
        </div>
        
      </div>
    `;
  }
}

loadInfo();
