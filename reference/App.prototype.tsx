import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, X } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

type Region = "All" | "RBA" | "RBAS" | "RBEC" | "RBLAC" | "RBAP";

interface Story {
  id: string;
  region: Exclude<Region, "All">;
  office: string;
  title: string;
  location: string;
  date: string;
  url?: string;
  images: string[];
  alt: string;
  credits?: string;
  captions?: Record<number, string>;
}

const REGIONS: Region[] = ["All", "RBA", "RBAS", "RBEC", "RBLAC", "RBAP"];

const STORIES: Story[] = [
  {
    id: "grapes-a-mission-possible",
    region: "RBEC",
    office: "UNDP Moldova",
    title: "Grapes \u2013 a \u201cMission Possible\u201d",
    location: "Moldova",
    date: "Oct 26, 2026",
    url: "https://undpmoldova.exposure.co/grapes-a-mission-possible",
    images: [
      "https://exposure.accelerator.net/production/posts/4994220/cover-photo/cover-1790877356.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/fIh15oKYHpc238ojvVzPdE7dsGDOI1U1ijFCdxcg6LU/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/jnTzkJvMTGwwKUGDGVTaj6Rw9kCNpuig2AYYgcwDHso/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/Jg9vUvdEsOnmDaSQmpV4ROr0bFlXkJjKwO8p0KdWvV8/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/HOKHkCBX4nRUiXP7QFiicoYomrO8Wv859DAAsVrYvig/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/2Zuo8viEoESl3iI6vS2xNnnjtmymdtpNiTMFMx8z1Kk/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/r9u6T7UU3WAYddmgqEdXqTEIfsMvJjDEWuKtz265nQs/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/SbUGZ5Kb3MNktbJRFoYDDTHJ3g9B3XrDbISx0ILq90E/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/IfNnYOP5Q33YZFeLQjKlIB89u7PrPVFMWuwekDlk5Hs/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/Bkdjw6eAjinIwln3oIrx6Lh2HRs2Ayou6frXdcE2ekQ/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/MtmRRWunh93utJwWxxAoYqc2nQKLHgCawIrJlvpfjEo/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ZPtYHnmkNLWzYinvUxuQ080PFgpowddUJZMXveUPQvM/original.jpg;resize(800,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/mk4aDJPgudglRmWv1ZtrZXzxcoC0dinC3UzlupxUud8/original.jpg;resize(400,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/vABm6yIrrTw6K6c25JttrGe1dfZlv2CPqdirvgtBN8Y/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/0DFqK85b09vTJurKbVJwPvxDQSKNEGZ6mauhV2682yw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/7LyLASecEQ9CDjmrrbOBHgTLrhN2x0ljHLQBCVhSqG0/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/M0r6fTDAdQLU6IVxWzlcgnekSqlym8lwSLd4gFTzcVg/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/k4EQy2FUMlimGjo6QWpGiC0NK5EWAs8sFG2ovdfWeuU/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/P9v3z5bQbyL5X1Vpk6uVGP9v6wYOc68mw9aSTIZbaiU/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/cyijuWor929CvUmcis3P4EqfCigkdI1x6yrsWuVvzSE/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/qaP85u9FqA8RpV9t5utzDvX7Ctjz91p7ofERimugZzw/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/mdwsgVvUN1YODWqCsKQBnxXWwp6GAeRo35E0Y6AcEro/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/knKA8lddqayC84yucuwNs9PcloU1SmhSbBDM3yOuSZw/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/aJfSRfgZigmXO6GNN14H3LKbciVjtLn4aEEskzZANzw/original.jpg;resize(1300,_).jpg?auto=webp",
    ],
    alt: "Grape farmers and agricultural modernization in Moldova",
    credits: "Photography: UNDP Moldova",
  },
  {
    id: "every-life-matters-bangladesh",
    region: "RBAP",
    office: "UNDP Bangladesh",
    title: "Every Life Matters: Protecting Biodiversity in Bangladesh",
    location: "Bangladesh",
    date: "Oct 25, 2026",
    url: "https://bdundp.exposure.co/every-life-matters-protecting-biodiversity-in-bangladesh",
    images: [
      "https://exposure.accelerator.net/production/photos/eeal0dp7wiczemietcdmok14x9eeyg364ppl/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/jk19fsq0npr6p4d85tpr6apgr77l550vqyou/original.png;resize(500,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/6njgohz0s8aqs1mk1p719kvf1yurh6cgjmmp/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/uqsfyt7zbrmb6rl83kihb86vsb7084sbyt6v/original.jpeg;resize(1100,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/yad7b1uefe9h81c00491kgikzftvu44onyay/original.png;resize(600,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/fg4g8buvp1bw9jpbdd9pwj45y82pvfhkiyrk/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/c88pyforlxwmfjv57x6z4gbsily2uenxu5e6/original.jpeg;resize(1100,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/vzcc6yivqujmi8w8d53mwsrs8tguowgfrzss/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/kxwe077isvdxrzpfxdj1s774zvselrr3a51f/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/pmuqwjpsvclftck2eoqynlz6nprxi8ypvg43/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/jqilnyqv6eqa548mnr47pq4o74zzspzwtgpw/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/41ybm9o7is7bt1vwpgp7ekceuu4vy20o812x/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/y68l1ehmx3y7jvpg4392a5g1giznl3s3ncnq/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/uda7awmyvvmy6ynlf5yse7c85neejyye2jk6/original.png;resize(1300,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/fthzgehu4x6tj6fqb2t63gdxkcm4wbm4iapv/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/r2hs8ty5p0c8ycop7a2ebghy2wb9kn5apekv/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/oz6kcej7g2hotfilzrd6ucy9jeth9jfagh8k/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/668ahh8bbjmt1ettxbhbassty62gy36tlmc8/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ws1vsytfi9em0a6lr6usy8kddnbjigiq3mxs/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/x5x5g2o3juht3d9lgljjwglneg1a1797kxpj/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5bx49rrr8sollkymxzn48e38hvz9i6ntvkri/original.jpeg;resize(1100,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/761mvosa1wmchadheowenekzm1p9z5guqh48/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/xi0khhrsthffkdyetaf7l8a4sxnsxxipappw/original.jpeg;resize(1100,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/gyhbzs0g9fwt024spy2gmm68orxzwj0sotch/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/tj3uyy2bh8qejn7hw93lr0rw5l5ly6u3cg0o/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/hevtudl3v6iz938h1s2hywz2j99bivizcxvc/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/dqa3pgvpius1it1zjrgwwol6ys44a7sslx7a/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/e69yhrw9mxmnuwujt9otfb4391o7c34nezdi/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/owewni9cigk6zz45flnyj69g2zqe87dob96m/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/xe6591k0pld4a8ezxyehpn7ekneual48iu04/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/q29mi2vt0vbmtzkb2547vtmsz972pze4a0t6/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/flylrygfay4ezlq6nbfcop111nf6yzmndcab/original.jpg;resize(700,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/blwk1js8stue8lz1fuowp8xfy0kax3ni8rhe/original.jpeg;resize(1100,_).jpeg?auto=webp",
    ],
    alt: "Protecting biodiversity and ecosystems in Bangladesh",
    credits: "Photos: Emdadul Islam Bitu, AB Rashid, Mosabber Hossain, Md. Habib Torikul, Joty Broto Basak Shanto, Adel Mustaque Ahmed",
  },
  {
    id: "trees-the-ancients-of-life",
    region: "RBA",
    office: "UNDP Zambia",
    title: "Trees: The Ancients of Life",
    location: "Zambia",
    date: "Oct 20, 2026",
    url: "https://undpinzambia.exposure.co/trees-the-ancients-of-life",
    images: [
      "https://exposure.accelerator.net/production/posts/4995141/cover-photo/cover-1792512182.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/b1q94jiho1spelkmc9jwnal9irdxcek1jias/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/weihlcjjdw7k1umwszyutxc5yihblcktl4go/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/48ehubb7t6h1yxrd7a7w26tfrqmofyqjd4ym/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wjci5hlkavsjm59rxcm1uv9a3inkpl8n5wty/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/oqp1q3h02p82r9w90wwti2dwddflk8dzlbgj/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4994921/cover-photo/cover-1792463193.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4994920/cover-photo/cover-1792460144.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4991659/cover-photo/cover-1785742541.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4990448/cover-photo/cover-1782685301.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4986091/cover-photo/cover-1774266972.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4983657/cover-photo/cover-1769422403.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
    ],
    alt: "Ancient trees and forest ecosystems in Zambia",
    credits: "Photography: UNDP Zambia",
  },
  {
    id: "road-to-the-market",
    region: "RBA",
    office: "UNDP Zambia",
    title: "Road to the Market",
    location: "Zambia",
    date: "Oct 20, 2026",
    url: "https://undpinzambia.exposure.co/road-to-the-market",
    images: [
      "https://exposure.accelerator.net/production/posts/4994920/cover-photo/cover-1792460144.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/hsnr8tjzk7oleg5aac5xg8jfxf20oyki4b3u/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/pa6vqf79boakt5v2myk9wcblqhqabi7rjd1f/original.png;resize(1300,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/gu8fh90vmqaetf31gvh3focaaldl0c6qjs3x/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bvit6u826lbh9pj0vto2kut73k9mzc3rejiu/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/1kzhjjkffkvekyudjwz6gd2j5rgblj8f7m6w/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/pa6hj9l73krhu8c3ztc3jgas1g6ikwqq9hdw/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/rsj0v4zaddfl6lhsms4hpzcrx62qzp88j726/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/px165fh9qudsx7fcd84coor8f1la59cjugar/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4995141/cover-photo/cover-1792512182.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4994921/cover-photo/cover-1792463193.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4991659/cover-photo/cover-1785742541.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4990448/cover-photo/cover-1782685301.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4986091/cover-photo/cover-1774266972.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4983657/cover-photo/cover-1769422403.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
    ],
    alt: "Farmers transporting produce on the road to the market in Zambia",
    credits: "Photography: UNDP Zambia",
  },
  {
    id: "meaning-in-every-drop",
    region: "RBAP",
    office: "UNDP Sri Lanka",
    title: "Meaning in Every Drop",
    location: "Sri Lanka",
    date: "Oct 12, 2026",
    url: "https://undpsrilanka.exposure.co/meaning-in-every-drop",
    images: [
      "https://exposure.accelerator.net/production/posts/4994649/cover-photo/cover-1791786198.png;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/4ot6yru6y9fqc6t1v1wpb8n7mvzaqbscrmn6/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/hcvu37djhjso1ts8zl5899drty82jnlmffve/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/evc8o4w21amz1aom3hfggy04kbzox7gznm7y/original.jpg;resize(700,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/0fmb2w3pz325p0z0h7bzkgx9zqfesji0eq9s/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/9orajojx9whs8y1k0d98wp42mo7x2qsuirwt/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/trpg7zozo1lci0v2lxzjdeenq4v7atdehoq2/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/exogaxlrjrd6h37v1ztk2r6cmwm4pax5g6a4/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3tawtgw34lkgy2xl4kflg9pi9smr1baa62ps/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wffqy23uj7bxbahehoj1oafn56kx1q51ie88/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/aywenso36wt20lne5ujpkmvogmfvnod277y6/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/nyerws7qkt080skfwg2yyptuwipahjnak1zw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/4vxkm6whj3jr4l5garr2bgut1pfd5r58au53/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/dr04ody9ta4c16mayv42a4r25bhdlo02z0zi/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/uq79kvmtwqeac0mp8fw88guzqt17789w4l9y/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/9uanfal99oa0j5abzhvcfjl09prp3c4pm579/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/u63rzmr53d2fz2akzp9kd8f9k8zbnzdyo14d/original.png;resize(1300,_).png?auto=webp",
    ],
    alt: "Water management and rural livelihoods in Sri Lanka",
    credits: "Photography: UNDP Sri Lanka",
  },
  {
    id: "gaza-entrepreneurs",
    region: "RBAS",
    office: "UNDP Arabic",
    title: "Women Entrepreneurs in Gaza: Sustaining Livelihoods Amid Crisis",
    location: "Gaza, State of Palestine",
    date: "Oct 05, 2026",
    url: "https://undparabic.exposure.co/women-entrepreneurs-in-gaza-sustaining-livelihoods-amid-crisis",
    images: [
      "https://exposure.accelerator.net/production/posts/4994388/cover-photo/cover-1791190927.jpeg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ktefcq6kanphosjx0x1uzt8w876efbcio90c/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/aqf2dipsyyj442feykrkqjrd3u43l9i1b4xd/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/gofie5uilr916a535upmrw8yq9ts67khoarh/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/1vzdcahm9rvnk5p4p3etwcfxoj1d9bx380ri/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/cjadaj02nz44msiu3hw7qtzwbh8vgzupwpox/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/owjdkmhkobilomc2nwzy4l2b373uefbhucz9/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4994090/cover-photo/cover-1790675886.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4993747/cover-photo/cover-1790016939.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4993692/cover-photo/cover-1789900610.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4993698/cover-photo/cover-1789906778.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4993009/cover-photo/cover-1788693735.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4992386/cover-photo/cover-1787341357.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
    ],
    alt: "A woman entrepreneur caring for livestock and livelihoods in Gaza",
    credits: "Photography: UNDP Arabic / Exposure",
    captions: {
      0: "Women entrepreneurs sustaining local economies and household resilience in Gaza.",
      1: "Nidaa with the poultry and ducks she raises for food security and livelihood.",
      2: "Nidaa caring for rabbits raised for income generation amid ongoing adversity.",
      3: "Hanaa displaying freshly made local cheese produced through micro-enterprise support.",
      4: "Hanaa boiling water over a campfire due to fuel and power constraints.",
      5: "Vocational skills carpentry workshop for women in Deir al-Balah, Gaza.",
      6: "Hanin, 36, assembling handcrafted wood structures during skill development."
    },
  },
  {
    id: "private-sector-sudan",
    region: "RBA",
    office: "UNDP Sudan",
    title: "Private Sector Led Solutions for Food Security and Economic Recovery",
    location: "Sudan",
    date: "Sep 14, 2026",
    url: "https://undpsudan.exposure.co/private-sector-led-solutions-for-food-security-and-economic-recovery",
    images: [
      "https://exposure.accelerator.net/production/posts/4993379/cover-photo/cover-1789301422.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/xqu7gf4wl2co4sbh9l6pjl7ccz76v6al4a3u/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ddts2rvq67ryjsv3quwffsep8aed76t4hq6e/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/r2fqkfk5akd11x6scn0ppgqb6mzrko5bdbzw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/layrvlchtfcpofyrswddo5kj6g1m5r24lcwa/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/e70cxfrvqv5bqp2cdfdz39kh4ew4hbqqzg5v/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/v2ulcu6oqqo730yf9opghep24ujqlcfudsj2/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/708tihqqg0seyd36z9fy4a7yb4co6qsxpi9u/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/kzdvl1svk6tdkkw3w9l5a7bpla0uyj8jn6rv/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/h7gjuxk8ughc89lvlostsgt7xgh34c419pnk/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/qnyzi9tch0fm4rzf9cglvff7wskxd41dnju3/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4990830/cover-photo/cover-1783628550.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4990289/cover-photo/cover-1782228526.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4988534/cover-photo/cover-1778498371.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4987428/cover-photo/cover-1776935882.JPG;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4986534/cover-photo/cover-1775040065.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4984965/cover-photo/cover-1771947865.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
    ],
    alt: "Private sector solutions for food security and recovery in Sudan",
    credits: "Photography: UNDP Sudan",
  },
  {
    id: "her-voice-her-future",
    region: "RBAP",
    office: "UNDP Bangladesh",
    title: "Her Voice Her Future",
    location: "Bangladesh",
    date: "Sep 05, 2026",
    url: "https://bdundp.exposure.co/her-voice-her-future",
    images: [
      "https://exposure.accelerator.net/production/photos/i8ibygelo7nykxtil9prkr76lop5ailsz8dw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zve3t24yqff1hf75r0royk9sokjogtooue1k/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/lgt74b4g82n2e6qrj4t9l172pyqmxyzo72w2/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3cuad6t3rn9v0dtzp563pjnwifkbu3ypl5qt/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5r50gjgdhehnxj1ko6ptfkfd3a3xygtrq0wo/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bo453ayj488ilakxx4btnxk3zlctojdsusp2/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bc4n3l2setouskk0z74a2xwlootab692nerv/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/e4tzr5n6gcunh2lj3umg4n6g1e53m9bjy3ci/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wjkc25f63of0xq2sibn4kldeafl248duauoj/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/s4jisbo1ibaft99lyg8jgdt6rio2qjy4ot8j/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/f01vtr54ftpmu147qhhjetennoqz8b2cjcuh/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/reqdbb7w5lzg6ywhkepfhe0mqcwqbv8jmmol/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wwjsf381vgbfic2132qdewv5h4nnv7xxpuqx/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ge9i28it88amjnhz1iczyvwksfarget1l4oo/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/lzy0m1l79skg8gv5tji5aaumth2va7h0ohdk/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/nhb8w63fepv6yrx2bctxke53xrgrf1lxkrtk/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/96uaazogudtgov4us96twvo0nvd7nap5b05k/original.jpg;resize(600,_).jpg?auto=webp",
    ],
    alt: "Women's empowerment and leadership in Bangladesh",
    credits: "Photography: UNDP Bangladesh",
  },
  {
    id: "small-grants-big-resilience",
    region: "RBAP",
    office: "UNDP Bangladesh",
    title: "Small Grants Big Resilience",
    location: "Bangladesh",
    date: "Sep 02, 2026",
    url: "https://bdundp.exposure.co/small-grants-big-resilience",
    images: [
      "https://exposure.accelerator.net/production/photos/w7ojrdhy2p91ak6ipnhifvhzp0zfustakgmw/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/643f8n54e979y8xc9mbocc0albcj522h0sbg/original.jpeg;resize(1100,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/f9wtgvdrl4f1tga1kn4p6nyd7njs0dxoh0ev/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/jx587ixxuaehevbvhih2h8r0lydo4pjrz01c/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/s7j5rahrnfcdhrws1pv3mfioggbmy4jswf5n/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ci8futs6gdjhgox1310f7mggfgofhr4aql67/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/8c0ei6a2num075ne8ep4tn7vf8hijh501p4f/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/dcil3wmbb46iiywfm1lg1jhp281vwtypdgqx/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5em4x813oaanjftg6f5jm8whxv1auuntgly8/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/rolrmiqp9dnt5tz7hoxkscvwj71v47vfr5m6/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/eu5uvrik28ugy5rp0o4z66ptkusfget8l9xs/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wnzgvaiwqhhl3hsknk3umj51zptnhaadck2i/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/srgas98uyjgzhg54etn0dgznr7pgxhwytv83/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3bkh7jevj55i64nafq118h9dok8cyywn8lij/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/tqd3gdqidl8tmse7ocrscspo2t6iz4mb2o66/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/oiwyxllav4gs6x9y3xq6f1ag5j1qqdx506jp/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/opvd9xbq0q5l6hu5rr4ej3dxh74bluf3skk9/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ip5atg7ae19g5ap7p9h6snscp59ca3k5s0qv/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/uqr6m7otjxu636kfvju77p6i0q5c3w3d91ql/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/grkc9t5uccnk3ns0e52ow7ng4besgbobltv5/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/v327ys88s49vel2kj9p499zyymwdy7carbgr/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/n8dmfr9bgsbk0w8t4fn90z58ulzlwnjgd43o/original.png;resize(600,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/ekxhqwvj2nv9iijo7gs4o8qk2m5vb22y95we/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/psypld5m15exh8txxttayipp8bnsceeantky/original.png;resize(1100,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/f224pqe791tyn7ek0n2khlng4d3zsfdxuwzs/original.jpeg;resize(1300,_).jpeg?auto=webp",
    ],
    alt: "Community resilience through small grants in Bangladesh",
    credits: "Photography: UNDP Bangladesh",
  },
  {
    id: "sudans-farms-feed-millions",
    region: "RBA",
    office: "UNDP Sudan",
    title: "Sudan\u2019s farms could feed millions not reached by aid",
    location: "Sudan",
    date: "Aug 03, 2026",
    url: "https://undpsudan.exposure.co/sudans-farms-could-feed-millions-not-reached-by-aid",
    images: [
      "https://exposure.accelerator.net/production/posts/4990830/cover-photo/cover-1783628550.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/yd09t88rk5s1e7dd5z7n5asriko9xz9uzwi4/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/8um8ozatmlcdo7z9zt0p0y2h56gajwup6ikp/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/t8cjzu75zkfx0e6hv21w4ehxdqikckklslgn/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ejkududc92g140sl2kvvcjetdmga3dy649oi/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/4z49pb86zqwbr57qs9inlbkrju0gig568adx/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/amv23tp6zdrf5ntfexz094nneoysrpnt7l5s/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/pj1hhdxy4kne7tz0ntf1peu3qtg1mmz44iwh/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/a3n07n2wa0aukmezdzdt2nhz43qnddnsdi40/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/dj0xg5xq5yfpfi9mfg3pv31bmvs8xoyadf6h/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/6cymy61juyb7cqczfhwr2p72pptdlp604wfo/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/sphd19vhvgelvx4pvwuwf44f0w2nwud4xnac/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5fvtlomi5ctel7rtc545su1lefxj4uphqygd/original.png;resize(1300,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/tjspw25l2jkec7ydqumdql910o52cgzyftty/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ayu8xxhv99glon4p1bfee495v1xr28jd0c11/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/4q53uaanordgnhwkb6213vnx1p0hzx0igu83/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/rb1i4osvcebg92fenb2okqw9nw64dp4b4ea4/original.jpg;resize(600,_).jpg?auto=webp",
    ],
    alt: "Agricultural revival and farming initiatives feeding communities across Sudan",
    credits: "Photography: UNDP Sudan",
  },
  {
    id: "when-water-finally-climbed-the-hill",
    region: "RBAP",
    office: "UNDP Bhutan",
    title: "When water finally climbed the hill",
    location: "Bhutan",
    date: "Jul 17, 2026",
    url: "https://undp-bhutan.exposure.co/when-water-finally-climbed-the-hill",
    images: [
      "https://exposure.accelerator.net/production/posts/4991093/cover-photo/cover-1784263260.JPG;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/1haku7u8avxs8z081s4q3p105zhu5sydc1zc/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3sekx6r6r0ib0qfs7ufgo9n3z5cywnn6ol17/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/7f5p4yrf1ujo96hxc7woj3a5iizzremwjopd/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/t9lsklyqp3m02k5l163pf8jbg0uqpsr86s1v/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/y3s1dh73zwlgewaglfzeh4p0o33g69ejxci2/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/eaisor72vwlnid7hh1xo1m9v2539rh9i5189/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5950c85lny5ox1gs19j0dngi1xzc6v1ep9ik/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3wwm0y8yjne2x6ezd26s1rlayppkx4hc0fs8/original.JPG;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/p4tf2bai3hfg4qhe8inbmrc477texqhzeh9e/original.JPG;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/hc5zmoikpkiam48vyhmcwf57y7hbzgxlbk4j/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3f86yc3cqigedbv2fl2xrox4fx1b20z2y0tn/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bdllupaiknqgl59wdogrkseo4snzv3dls4xp/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/r85s5rg79dmwmxtqc7x37cxhikv5trxlkk7t/original.jpg;resize(1300,_).jpg?auto=webp",
    ],
    alt: "Clean water reaching mountain villages in Bhutan",
    credits: "Photography: UNDP Bhutan",
  },
  {
    id: "green-cycle-yemen",
    region: "RBAS",
    office: "UNDP Yemen",
    title: "The green cycle: How strong agricultural systems power food security in Yemen",
    location: "Abyan, Yemen",
    date: "Jul 06, 2026",
    url: "https://undpyemen.exposure.co/especrp-in-abyan",
    images: [
      "https://exposure.accelerator.net/production/photos/knrnu47ho6pyot0keauvru8agpexbxf5fnpc/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zpxyzbze51cg6egflwo3m9sjt6yseb592iu3/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/795p6el65hm2ght8atwocb92shm2pbyc402j/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/b6baks2rkrduobx3llc1ekvavi84sxzbmpz1/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/1cy2cmyah9gwadmx6lax9isqcrcvzx687wz7/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/qu0ijlumrnsyuudxsisdj9ftiwmucn4sa0gt/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/k2sv66hspwv8pntpw5yv8mln14wn4kgk5x6y/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/snfurn83v5gsmvw9nyqceqtkb15ytm343xzi/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/4avmiwhvikhwc38od7jax8gckmdgegxogxxh/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/yykbdrzvh1a2eeu9nx6f4cn8tzppum5olkof/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/vqkrg1i59dkpymzqqydugj1n1udbznyh1795/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/n4r0ayo91zojfih5lbpojja4dfjgw7c2ogis/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/g5qcexrmdf86m9bu6wz7lj4gyq7gf797saq3/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/jkql168ir3pg735hlej9a4sp7p2ijlo4wgg7/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bnjmduzf9yta9tivbn5fkae6yiyxjorz4j34/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/gq5hxiqf2mb5juuleud2vehbsph3z2059no4/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/z8wjuiyrdreskm24hzysb2epfsi9ejvis74p/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/y8117u7us1p947eb03gcgvhlk749cg10mh9n/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/yybcyae9j59iqr7o4vhiv9ew0q5s8e0z6nhw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/fut9fv1g638xwjham5xflpdk1ol2fx84obrp/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wdbysx0kn3f8lkx4ztvyvxxq7uniunj7crud/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/n1321r2889m3qpdoy5ql87cbv4fj23mnh910/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/69g6w0stwuo7yui6hiqrgk9jynmgyuochdsn/original.JPG;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/t80egneu3czn4qgax8s7l8hoblpnoffyk2rg/original.JPG;resize(600,_).jpg?auto=webp",
    ],
    alt: "Agricultural systems supporting food security in Abyan, Yemen",
    credits: "Photography: UNDP Yemen",
  },
  {
    id: "sembrar-confianza-colombia",
    region: "RBLAC",
    office: "PNUD Colombia",
    title: "Sembrar confianza: un camino para restaurar la paz",
    location: "La Pailita, Yarumal, Antioquia, Colombia",
    date: "Apr 22, 2026",
    url: "https://pnudcolombia.exposure.co/sembrar-confianza-un-camino-para-restaurar-la-paz",
    images: [
      "https://exposure.accelerator.net/production/posts/4987403/cover-photo/cover-1776876588.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/9ly16w2gf1a5w7hb8mqsr8c9k3bzo672kbik/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/g0578l2p7l43oa39sqz45j4cp2jj7n2ch1yh/original.jpeg;resize(700,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wp2p8whbotnpo1i2qw7c3j8exe30lkprlmrm/original.jpeg;resize(500,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/7id86ivef1a4aw4clfolbcspadkazc2s1iwp/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/1xmsjxr42yebnhufax8nchfzg4j76884p3ze/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zz2tew1ui08dw2tf5dofkoj45irckbnpygrn/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3v3d5ovnyy4dhq3em5y7m4zuess9cbhrf942/original.jpeg;resize(1300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5hby1adensettzrgm07fnlersxwuzwud5su6/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/l0771uxq66ylumbgdthnbpm7wjvtu4y8yj4m/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/2g7xhvwkbipbv2jynhmclloln6pe973kt5qr/original.jpg;resize(1300,_).jpg?auto=webp",
    ],
    alt: "Yaneth Fern\u00e1ndez and her community restoring rural landscapes in Antioquia, Colombia",
    credits: "Historia y fotograf\u00edas: Juan Manuel Chavarr\u00eda Quintero \u00b7 Fotos de archivo: cortes\u00eda de Yaneth Fern\u00e1ndez Uribe",
    captions: {
      0: "Yaneth Fernández en las montañas de Yarumal, sembrando confianza y restauración comunitaria.",
      1: "Vereda La Pailita: una comunidad tejiendo la relación entre naturaleza y territorio.",
      2: "Archivo familiar: historia de arraigo campesino en el Norte de Antioquia.",
      3: "Generaciones protegiendo la biodiversidad y el Corredor del Jaguar.",
      4: "Esperanza y liderazgo comunitario frente a los desafíos ambientales.",
      5: "Vivero agroecológico y siembra de especies nativas en Antioquia.",
      6: "Reconversión productiva y prácticas agrícolas sostenibles.",
      7: "Yaneth compartiendo saberes comunitarios en Valdivia, Antioquia.",
      8: "La tierra como proyecto de vida y pilar para la paz territorial.",
      9: "Recuperación de la salud del suelo y conectividad de los ecosistemas.",
      10: "Restauración ambiental con enfoque de género y desarrollo rural."
    },
  },
  {
    id: "piloting-safety-dhaka",
    region: "RBAP",
    office: "UNDP Bangladesh",
    title: "Piloting Fire Safety for Dhaka\u2019s Urban Poor",
    location: "Dhaka, Bangladesh",
    date: "Apr 20, 2026",
    url: "https://bdundp.exposure.co/piloting-safety-for-dhakas-urban-poor",
    images: [
      "https://exposure.accelerator.net/production/posts/4987105/cover-photo/cover-1776312983.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/l4g4uh6vwi8trs7banaj6dw63gua8oklqc0d/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/fd3eq5omvelhjf9zbudrvab9f8rnwi79otlw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/0gflyzi649lhoalpieq8atd9qwtgr8trw3j8/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/jdohfkkm9y2v996fwnlfng5c8il5cjjhwybg/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/mn2iu7zze5fyxhtekikmol7xnfos5qdiv33a/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/yxqpndbxkirxf7gtczg6rraairgl4qdmg12b/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bqfhursx5dskqtm2fqyhvdouq1axeopsmn5g/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/kk4jfc70ga7oipilif5da1ps6uaahxnpu2sa/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/lezrh7hwksnlblb3fne6ys77nuimf5mgyg4w/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/kcsnmb6iv9ewrezso478c844w9ujuq727x7a/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/tj5d4ak8idbm5ak185wc1dzo4eodmcuapfhe/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/99jlsk7xmthfz4o5j8tjhn7prn0ocet3buo8/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zc2kl52p7mmskbzhpmkrjnr45cig60eyi4ji/original.jpg;resize(1300,_).jpg?auto=webp",
    ],
    alt: "Urban safety and livelihoods for Dhaka's urban poor",
    credits: "Photography: UNDP Bangladesh",
  },
  {
    id: "work-that-gives-hope-kharkiv",
    region: "RBEC",
    office: "UNDP Ukraine",
    title: "Work that gives hope: How children are being saved from cancer in Kharkiv",
    location: "Kharkiv, Ukraine",
    date: "Apr 08, 2026",
    url: "https://undpukraine.exposure.co/work-that-gives-hope-how-children-are-being-saved-from-cancer-in-kharkiv",
    images: [
      "https://exposure.accelerator.net/production/posts/4986816/cover-photo/cover-1775650659.JPG;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3n276q5lhmcb98qa0thaon6ekik8gt05421g/original.JPG;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/qi3vwqwkorevhwxniuylj2o4zwuvd0ba2yza/original.JPG;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/h9pdikhr2wh7o480cp9945fww9eb3he4r004/original.JPG;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/hx4m8o2nrx8b82hynkyz85dsbh18a6j5ut6c/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/0f033chqkj93tdiaah3ncu47qytfej5stk5p/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/nijmw0vv9ortuv5c2b4vbhakvw8011b543f0/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ou6g8gz487n1ic6zr7aoz2v7rifdc8fqy13g/original.JPG;resize(1300,_).jpg?auto=webp",
    ],
    alt: "Doctors and nurses caring for children with cancer in Kharkiv, Ukraine",
    credits: "Photography: UNDP Ukraine",
  },
  {
    id: "when-the-skies-cleared",
    region: "RBAP",
    office: "UNDP Pakistan",
    title: "When the Skies Cleared",
    location: "Pakistan",
    date: "Nov 27, 2025",
    url: "https://undp-pakistan.exposure.co/when-the-skies-cleared",
    images: [
      "https://exposure.accelerator.net/production/posts/4981185/cover-photo/cover-1764226317.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3z3cda4n868lskt7at6iv8l7nbxa92ge1r20/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zwvf30olt5b8tsrtizkq76c6bmpz4w2vxasi/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/9s8rx0u60am97rabnxjxq7u9g1azeehljx6k/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/gk1suf6bzri0nziueuj4g1ictji2xqwzzeai/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/gpyqsukwwpcmkspzzjytedl8bgrli8dw5x2x/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/sqhioz7tdldzuqqbugc6fnfzesqw7bqv5fhd/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ifc1h135alopgdm8pbjj6sr3am9d4merjcl5/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/s5lq0jt09co77e9amtxz2419fchbkdzaba93/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/8j1es5egifxpepuo76a37i51e4vpuziabus4/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/w5bzv0cvf2fv2vjg7nq0ti1o16ks7oqozohk/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/p3v1p6vpsvivl5ou60ok6anjfgwjcp3glef4/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4991957/cover-photo/cover-1786446585.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4985858/cover-photo/cover-1773725746.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4985649/cover-photo/cover-1773290011.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4985608/cover-photo/cover-1773221202.jpeg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4983763/cover-photo/cover-1769574744.jpg;resize(700,400,crop)/1x.jpeg?auto=webp",
      "https://exposure.accelerator.net/production/posts/4982180/cover-photo/cover-1766126363.png;resize(700,400,crop)/1x.jpeg?auto=webp",
    ],
    alt: "Communities recovering in Pakistan after the floods",
    credits: "Photography: UNDP Pakistan",
  },
  {
    id: "from-barren-lands-nepal",
    region: "RBAP",
    office: "UNDP Nepal",
    title: "From barren lands to thriving farms",
    location: "Nepal",
    date: "Oct 07, 2025",
    url: "https://undpnepal.exposure.co/from-barren-lands-to-thriving-farms",
    images: [
      "https://exposure.accelerator.net/production/posts/4977866/cover-photo/cover-1759747347.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/qc47tu6xh1n6i2z8ianuca18t00lppsa38bh/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/k7o298tdt3pi842ndfnrp06zofik4otrt704/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/9nrqnghy3rk2fjijdzr3k4fw8i2z7jy7bjf4/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/hokfz972umhi2n36m1y8adi4cend55141j0k/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/41pz7bl77ssssl9ls0udvx70b83l62nl16c1/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/d5ft6ncluisrxegxtrmojny5r48xi1a6j937/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/1yxhipxm1lvgrn8gfibbopapvjhjv4tn4gz4/original.JPG;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/g9h31ou1brot7wain0lcbrpiq2qddm0hn6sv/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/pd3xbp4b6mfpkm1l664odaq291c0rtjv9t4m/original.png;resize(1300,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/broj7ozducgnjk2vqk6ncmixu1y300i7f3ws/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/0d5h9ywu65uvl9ul4e2gjbpee231t39z3cgo/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/opvyx9cmzwk3x3jedlopo824yy2191fwkhe2/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/h135muk126vtics7ktapf7cpj2iau46q64ug/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/dub46aaerpqrtrnhpavhklcef1vfg41bxk8h/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/irsdud2ml8n8lohqspjehe5ue9gf092iq2pu/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/985z1pubwcj30akwp4wjfd2mfqp2t4z1ol4y/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zzaffhog9a8p0qdxn4lfic2tm7pw44fwdsvy/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/14z93920ha5iv762gs7e8qqph9ya92z69fjw/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bbubjlgnqh9wbz8tgapbhxg7139i4o60dqjz/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ybf89li0fzb5kw28kjtblufhqotbknqb97l1/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/xmhgt6i1hl7azh8rs38ji91he56kvavh2guj/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/14gbfj8zgiyz1de89fr778emonl65qvt7z7a/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bda9t2jf39acn78jwg5vvkwimvjc0ql6h89q/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/9p1pdjr1rwwmnnmq8ef17aahx8uaak3zughb/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/5o7tlu9q287zla0hn5jzmqhrxn61mzjsdr0i/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/w1q68rdaa5iveph7t4xoenzdgf036z3tkipr/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/iid8qug44bjoc07m4hhe09c61llga229k7i7/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/wjhvj1266rrs32mqvuveuutv4je716slrjei/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3rx83ntolldufktopgcbrgvmvvkg508feqvu/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/smj6u5jn0ntz91mtdvv8uacoyg7wzlc5vpfo/original.jpg;resize(1300,_).jpg?auto=webp",
    ],
    alt: "Transforming barren lands into productive farms in Nepal",
    credits: "Photography: UNDP Nepal",
  },
  {
    id: "de-la-tradition-a-linnovation",
    region: "RBA",
    office: "PNUD Mali",
    title: "De la tradition \u00e0 l\u2019innovation",
    location: "Mali",
    date: "May 07, 2025",
    url: "https://pnudmali.exposure.co/de-la-tradition-a-linnovation",
    images: [
      "https://exposure.accelerator.net/production/posts/4970690/cover-photo/cover-1746629735.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/tha0b5w3cbe9e15th20wqwhk48m4qw21fkgd/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/urvv6wp87kf1o8plowwvc435exqjustdexwc/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/nu71b66gsc9proazvbbavbtyqldr9burqbgp/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/m55h0compu5xhj2iabwp3ehanygphdfu7zql/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/tcjop1x59gvwlhqtnyefc67d2ipnnrcu0nmq/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ck8olzkahj83n86q0um28hxt3jt09drqd81f/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/lof8fjqdy9rmv73w4hioj4901ocofuhzvx75/original.jpg;resize(600,_).jpg?auto=webp",
    ],
    alt: "Artisans and innovators blending tradition with progress in Mali",
    credits: "Photographies: PNUD Mali",
  },
  {
    id: "the-way-of-water-maldives",
    region: "RBAP",
    office: "UNDP Maldives",
    title: "The Way of Water",
    location: "Maldives",
    date: "Feb 02, 2024",
    url: "https://undpmv.exposure.co/the-way-of-water",
    images: [
      "https://exposure.accelerator.net/production/posts/3569973/cover-photo/cover-1706778936.jpg;resize(1300,_,crop).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/btq3gep8khpxylcevcs5g8w7lf29wjgu57e7/original.JPG;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/lxwvgyhc76v6nw53awwt6nragn741mk9d8r0/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/64rin9cvunq7zoygx0y3w4zg3qwkcrz8k9g9/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/u3z48zayvflovwshuo303nep6jqieskf2fae/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/6shc6jub7v69ze3g1p4j2depmr79l67ubt68/original.jpg;resize(800,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/6vyhd53bxixmitzaigx3u6zm4z0lngy9f6ty/original.jpg;resize(400,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/v2cgwwi5i3ffm3lwqp67g91t0105j19cmcj9/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/je59kgqae1lt63cpx585y7hr0zqnnspkrzn7/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/l4iafmjxzb01w7ihugjhu25x4cvek6bws1l9/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/o7hwf1g2ymn6iiq7oyw7to1pgxd3mkp5qzj9/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/zts92le3xpf9zrzqgpv8gisski9469djap4j/original.jpeg;resize(700,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/8owf1rp24uizno55ghyfgjw7c42b8wjktpd4/original.jpg;resize(700,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/afa1m64yd7n5c7iwjrq6uqhoyagricm6c48p/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/p7gy0f9fr0jutqarmoolhtmtgjlrqkcettbc/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bz5236dd0i4n5jmsfk5t9k9ilpbxns6x6i5a/original.jpeg;resize(500,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/buavge9oh6ogvzmnfs7ca67mmynzk44anj1o/original.jpeg;resize(600,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/b8ck2hgnkz6xp3uz2p112pn5967210oynmua/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ysmmhb953lhxv9nfhdddzh95gpn4lja2obav/original.jpeg;resize(400,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/rymlhurqr5p85brd9hkjdjhgl5w97tay8745/original.jpeg;resize(300,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/uhqp3lml9yzle9oqpkc2coouyzao770f1sej/original.jpeg;resize(400,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/cmatwulzllassibtuyc48g6yha28m6k2tm6p/original.jpeg;resize(700,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/saen21kehlrk7wnt2d2zcghld42462a9vfss/original.jpeg;resize(400,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/eqohjl40jtltbk77rccb9o0yw5xc6unsulb4/original.jpeg;resize(700,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/q6d63gkiw4co6mlkywv23nkx7mx77yuhw3w0/original.jpeg;resize(400,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/g2d4m2oqypeiv95x60py7dd5mf1g7erbn823/original.jpeg;resize(1100,_).jpeg?auto=webp",
      "https://exposure.accelerator.net/production/photos/7yjryxnhl6s1yeaq64r0uolt5d7lf2rqrmoi/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/3b78h3y1nrgsz5eanxcqt5rqrup996166ejg/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/323rymdkftsd7cxiv0q41l90rnxh67w490ue/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/ihsbxpz1t3apjb9zb19bnchqhdce83avpym7/original.JPG;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/e8lughfnbpo99fjyzrunnnvtb0a4dy6sat3r/original.jpg;resize(500,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/4s6u5006nqk817bey6ohvu8x0gksg53afj3z/original.JPG;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/yxhwd0zr8lt775ayf4hrpn56v7oxjnc955rb/original.jpg;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/bp5fzrb6d3lzch1ma9wuaztif6m57w331hjg/original.JPG;resize(1100,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/eg83nrh9t3pl7bkgm16g8y4kammo7m7pcdn7/original.png;resize(600,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/z2esyj6bkq58vfosfkg6rm8l1w0fyptrgquq/original.jpg;resize(600,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/h1nwpyndblnlna7qm4o95osb8vw79lahsiza/original.png;resize(600,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/3tfavfsul414yvnhbi1b7e568cn5cbidvt9c/original.png;resize(600,_).png?auto=webp",
      "https://exposure.accelerator.net/production/photos/js3nkyzorihv6wpcmrwapworh4ofh3f1lrrr/original.jpg;resize(1300,_).jpg?auto=webp",
      "https://exposure.accelerator.net/production/photos/y1vgm3t1qbuvb86e7w0ob4cumx07mfa3b9vw/original.png;resize(1300,_).png?auto=webp",
    ],
    alt: "Water management, conservation and island resilience in Maldives",
    credits: "Photography: UNDP Maldives",
  },
];

export default function App() {
  const [activeRegion, setActiveRegion] = useState<Region>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    STORIES.forEach((story) => {
      const match = story.date.match(/\b(20\d\d)\b/);
      if (match) years.add(match[1]);
    });
    return ["All", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, []);

  const filteredStories = useMemo(
    () => {
      return STORIES.filter((story) => {
        const matchesRegion = activeRegion === "All" || story.region === activeRegion;
        const matchesYear = selectedYear === "All" || story.date.includes(selectedYear);
        return matchesRegion && matchesYear;
      });
    },
    [activeRegion, selectedYear],
  );

  const getRegionCount = useCallback(
    (region: Region) => {
      return STORIES.filter((story) => {
        const matchesRegion = region === "All" || story.region === region;
        const matchesYear = selectedYear === "All" || story.date.includes(selectedYear);
        return matchesRegion && matchesYear;
      }).length;
    },
    [selectedYear],
  );

  const getYearCount = useCallback(
    (year: string) => {
      return STORIES.filter((story) => {
        const matchesRegion = activeRegion === "All" || story.region === activeRegion;
        const matchesYear = year === "All" || story.date.includes(year);
        return matchesRegion && matchesYear;
      }).length;
    },
    [activeRegion],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1560px] px-5 pb-9 pt-5 sm:px-8 sm:pb-12 sm:pt-7 lg:px-12">
          <div className="mb-16 flex items-center justify-between sm:mb-24">
            <a
              href="#archive"
              className="font-proxima-condensed text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-accent"
            >
              UNDP / Exposure
            </a>
            <div className="flex items-center gap-3 font-proxima-condensed text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <span className="h-2 w-2 bg-accent" aria-hidden="true" />
              Global photo archive
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.75fr)] lg:items-end">
            <h1 className="max-w-4xl font-display text-[clamp(1.85rem,4.8vw,4.65rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.92] text-foreground">
              UNDP Exposure
              <span className="block text-accent font-extrabold tracking-[-0.025em]">PHOTO ARCHIVE</span>
            </h1>
            <div className="lg:pb-2">
              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Collection of all photos posted in different UNDP exposure sites.
              </p>
              <p className="mt-7 font-proxima-condensed text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {STORIES.length.toString().padStart(2, "0")} stories / {STORIES.reduce((count, story) => count + story.images.length, 0)} photographs
              </p>
            </div>
          </div>
        </div>
      </header>

      <main id="archive" className="mx-auto max-w-[1560px] px-5 pb-20 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between border-b border-border py-3 sm:py-3.5">
          <nav
            aria-label="Filter archive by region"
            className="flex min-w-0 items-center gap-1 overflow-x-auto pr-3"
          >
            {REGIONS.map((region) => {
              const count = getRegionCount(region);

              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setActiveRegion(region)}
                  className={`group flex shrink-0 items-baseline gap-1.5 px-3 py-1.5 font-proxima-condensed text-sm font-bold uppercase tracking-[0.12em] transition-colors first:pl-0 sm:px-3.5 sm:py-2 ${
                    activeRegion === region
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-pressed={activeRegion === region}
                >
                  {region}
                  <span className="text-[10px] font-semibold opacity-65">{count.toString().padStart(2, "0")}</span>
                </button>
              );
            })}
          </nav>

          <div className="shrink-0 pl-2">
            <YearDropdown
              years={availableYears}
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              getYearCount={getYearCount}
            />
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
            <p className="font-card-title text-lg font-semibold text-foreground">
              No photo stories found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no stories in {activeRegion === "All" ? "the archive" : activeRegion} for {selectedYear === "All" ? "the selected period" : selectedYear}.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveRegion("All");
                setSelectedYear("All");
              }}
              className="mt-6 border border-accent bg-accent px-4 py-2 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeRegion}-${selectedYear}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid auto-rows-[19rem] grid-cols-1 gap-2 pt-2 sm:auto-rows-[23rem] sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredStories.map((story, index) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  featured={activeRegion === "All" && selectedYear === "All" && index === 0}
                  onOpen={() => setSelectedStory(story)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <footer className="mt-16 flex flex-col gap-4 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Stories of development, told in photographs.</p>
          <p>United Nations Development Programme</p>
        </footer>
      </main>

      <AnimatePresence>
        {selectedStory && (
          <StoryLightbox story={selectedStory} onClose={() => setSelectedStory(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function YearDropdown({
  years,
  selectedYear,
  onSelectYear,
  getYearCount,
}: {
  years: string[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  getYearCount: (year: string) => number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filter archive by year. Currently selected: ${selectedYear === "All" ? "All years" : selectedYear}`}
        className={`flex items-center gap-2 border px-3 py-1.5 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:px-3.5 sm:py-2 ${
          isOpen
            ? "border-accent bg-card text-foreground shadow-lg"
            : selectedYear !== "All"
            ? "border-accent bg-card text-accent hover:border-accent"
            : "border-border bg-card/60 text-muted-foreground hover:border-white/30 hover:bg-card hover:text-foreground"
        }`}
      >
        <span className="text-[10px] font-semibold tracking-[0.16em] text-white/50">YEAR</span>
        <span className={selectedYear !== "All" ? "font-extrabold text-accent" : "text-foreground"}>
          {selectedYear === "All" ? "All Years" : selectedYear}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180 text-accent" : "text-muted-foreground"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            aria-label="Select year"
            className="absolute right-0 top-full z-40 mt-1.5 min-w-[170px] border border-border bg-[#1c2532] py-1 shadow-2xl backdrop-blur-md"
          >
            <div className="border-b border-white/10 px-3 py-1.5 font-proxima-condensed text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
              Filter by year
            </div>
            {years.map((year) => {
              const isSelected = selectedYear === year;
              const count = getYearCount(year);

              return (
                <button
                  key={year}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectYear(year);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 font-proxima-condensed text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                    isSelected
                      ? "bg-accent/15 text-accent font-extrabold"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 transition-opacity ${
                        isSelected ? "bg-accent opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                    {year === "All" ? "All Years" : year}
                  </span>
                  <span className="font-mono text-[10px] font-semibold opacity-60">
                    {count.toString().padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StoryCard({
  story,
  featured,
  onOpen,
}: {
  story: Story;
  featured: boolean;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    if (!hovered || story.images.length < 2) {
      setImageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % story.images.length);
    }, 1050);

    return () => window.clearInterval(interval);
  }, [hovered, story.images.length]);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={`group relative isolate overflow-hidden bg-card text-left ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
        aria-label={`View photographs from: ${story.title}`}
      />

      <AnimatePresence initial={false}>
        <motion.div
          key={`${story.id}-${imageIndex}`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-20%" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={story.images[imageIndex]}
            alt={story.alt}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          />
        </motion.div>
     </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 opacity-30 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100" />

      <div className="absolute left-4 top-4 flex items-center gap-2 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.14em] text-white sm:left-5 sm:top-5">
        <span className="bg-accent px-2 py-0.5 text-accent-foreground font-extrabold">{story.region}</span>
        <span className="drop-shadow-md font-semibold tracking-[0.12em]">{story.date}</span>
      </div>

      {story.url && (
        <a
          href={story.url}
          target="_blank"
          rel="noreferrer"
          className="absolute right-4 top-4 z-20 flex h-9 items-center gap-1.5 border border-white/40 bg-black/20 px-3 font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:right-5 sm:top-5 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          aria-label={`Read story on Exposure: ${story.title}`}
        >
          Read story
          <ArrowUpRight size={14} strokeWidth={1.5} />
        </a>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-all duration-300 sm:p-5">
        <p className="mb-1.5 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 drop-shadow">
          {story.office} · {story.location}
        </p>
        <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-300 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100">
          <div className="overflow-hidden">
            <h2 className={`max-w-3xl font-card-title font-bold leading-[1.14] tracking-[-0.015em] drop-shadow-md py-1 transition-transform duration-300 ease-out translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0 ${
              featured ? "text-2xl sm:text-4xl lg:text-5xl" : "text-xl sm:text-2xl"
            }`}>
              {story.title}
            </h2>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          {story.images.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`h-[2px] transition-all duration-300 ${
                dotIndex === imageIndex ? "w-7 bg-accent" : "w-3 bg-white/45"
              }`}
            />
          ))}
          <span className="ml-2 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
            {story.images.length} photos
          </span>
        </div>
      </div>
    </article>
  );
}

function StoryLightbox({ story, onClose }: { story: Story; onClose: () => void }) {
  const [imageIndex, setImageIndex] = useState(0);
  const currentCaption = story.captions?.[imageIndex];

  const previous = useCallback(() => {
    setImageIndex((current) => (current - 1 + story.images.length) % story.images.length);
  }, [story.images.length]);

  const next = useCallback(() => {
    setImageIndex((current) => (current + 1) % story.images.length);
  }, [story.images.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, onClose, previous]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/15 px-4 sm:px-7">
        <div className="min-w-0">
          <p className="truncate font-proxima-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/65">
            {story.office} / {story.region}
          </p>
          <p className="mt-1 hidden truncate font-card-title text-sm font-semibold text-white sm:block">{story.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-6 flex h-9 w-9 shrink-0 items-center justify-center border border-white/25 text-white transition-colors hover:bg-white hover:text-black"
          aria-label="Close story"
        >
          <X size={17} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-8">
        {currentCaption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4 sm:bottom-6 sm:px-12">
            <div className="max-w-2xl bg-black/85 px-4 py-2 backdrop-blur-md border border-white/20 text-center shadow-2xl">
              <p className="font-card-title text-xs leading-relaxed text-white sm:text-[13px]">
                {currentCaption}
              </p>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={imageIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full items-center justify-center"
          >
            <ImageWithFallback
              src={story.images[imageIndex]}
              alt={`${story.alt}, photograph ${imageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {story.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-4 flex h-11 w-11 items-center justify-center bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:left-8"
              aria-label="Previous photograph"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 flex h-11 w-11 items-center justify-center bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:right-8"
              aria-label="Next photograph"
            >
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-proxima-condensed text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            {story.location}
          </span>
          {story.credits && (
            <>
              <span className="hidden text-white/30 sm:inline" aria-hidden="true">·</span>
              <span className="font-proxima-condensed text-[11px] font-medium tracking-[0.04em] text-accent">
                {story.credits}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {story.url && (
            <a
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-proxima-condensed text-[11px] font-bold uppercase tracking-[0.12em] text-white/70 transition-colors hover:text-accent"
            >
              View on Exposure
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </a>
          )}
          <span className="font-proxima-condensed text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            {(imageIndex + 1).toString().padStart(2, "0")} / {story.images.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
