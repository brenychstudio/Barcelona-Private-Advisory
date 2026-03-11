export type District = {
  slug: string;
  title: string;
  image: string; // nb-01...nb-07
  fit: string;   // короткий “who it fits”
};

export const districts: District[] = [
  { slug: "eixample",     title: "Eixample",     image: "/demo/neighborhood/nb-01.png", fit: "geometry · walkable · classic-renovation" },
  { slug: "gracia",       title: "Gràcia",       image: "/demo/neighborhood/nb-02.png", fit: "human scale · design · quiet streets" },
  { slug: "sarria",       title: "Sarrià",       image: "/demo/neighborhood/nb-03.png", fit: "family · green · calm daily life" },
  { slug: "poblenou",     title: "Poblenou",     image: "/demo/neighborhood/nb-04.png", fit: "modern · creative · near tech hubs" },
  { slug: "diagonal-mar", title: "Diagonal Mar", image: "/demo/neighborhood/nb-05.png", fit: "coastal modern · views · terraces" },
  { slug: "barceloneta",  title: "Barceloneta",  image: "/demo/neighborhood/nb-06.png", fit: "sea proximity · compact · lifestyle" },
  { slug: "pedralbes",    title: "Pedralbes",    image: "/demo/neighborhood/nb-07.png", fit: "villa calm · privacy · premium" },
];
