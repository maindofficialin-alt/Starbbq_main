import Link from 'next/link';
import { ArrowLeft, Star, User } from 'lucide-react';

const REVIEWS = [
  { name: "Taara", text: "Cozy place to the roadside, not a place for quick snack as they aren’t with good capacity staff but good for slow evenings. They have good variety of menu with Shawarmas wrapped with Tikkas, Haleem for this season, Tikka, Grilled Chicken …" },
  { name: "Harshavardhan Mandali", text: "The kebabs taste absolutely awesome — very flavorful and unique compared to regular barbecue places. Their shawarma puri concept is something different and definitely a must-try if you visit. Overall, a nice place for kebab lovers who want …" },
  { name: "upender kodari", text: "Star BBQ is a solid go-to for haleem, shawarma, and kebabs. The haleem is rich and perfectly spiced, the shawarma is juicy and well-balanced, and the kebabs have that proper smoky grill flavor. Great taste, good portions, and quick service. …" },
  { name: "Arunabiram Jayachandran", text: "I stopped here after noticing their catchy banners, and I’m glad I did! Grill chicken has become rare these days (most places only serve tandoori), so I was happy to find it here. I ordered a half grill chicken parcel for ₹300, and it was …" },
  { name: "Sanjeevni Nayak", text: "Tried haleem for the first time loved every bit of it. The food is sooooo good ❤️👏🏻 …" },
  { name: "Sai Krishna", text: "STAR BBQ lo తిన్న తర్వాత ఇంకో చోట చికెన్ ఆర్డర్ చేయగలిగితే… నీకు మైండ్ కంట్రోల్ పవర్ ఉంది బాస్!” [Translation: After eating at STAR BBQ, if you can order chicken anywhere else... you have mind control power, boss!]" },
  { name: "Raghavendra Peddi", text: "Tried Star BBQ’UE in Nallagandla over the weekend - and oh man, what a kebab fest it turned out to be! On a friend’s reco, I walked in hungry and walked out obsessed. It’s been a while since I’ve binged on kebabs like this! …" },
  { name: "YBA- BiteAndBeyond", text: "Tried their shawarma which was average, though the use of atta roti instead of maida is a good touch. …" },
  { name: "Vaibhav Chavan", text: "Has been a go to place for kebabs and shawarma (a protein fulfilment place) since the last 4months. Must try !! Recommended!! …" },
  { name: "Deepa K", text: "Taste wise ok ok. Tried kababs and shawarma. As chicken is marinated for long hours i felt it's not fresh. Masala thumps up is also ok ok. Service, ambience is good. Man at billing counter was extremely friendly. …" },
  { name: "Saivamsi Athikela", text: "😋 delicious kebabs. I loved them. first i ordered a haryali kebab shawarma and Tangdi kebab...loved them. so i ordered tandoori wings again...they are good. not too spicy. not too plain...balanced masala.. anyone can eat them. even kids can …" },
  { name: "Saihemanth Kolluri", text: "Crazy food. must visit place its very great than any other kebabs centers …" },
  { name: "VASU VERMA", text: "The shwarma is a must have, the best thing they wont use khubus. They use whole wheat roti as a wrap. So thats healthy. Try tikka shwarma. …" },
  { name: "Abhinav", text: "Star BBQ is a great place for anyone who loves delicious grilled flavors and a cosy dining experience. The food is well-seasoned, freshly prepared, and served hot. Their barbecue items are tender, juicy, and cooked to perfection, especially …" },
  { name: "lakshmi RV", text: "I ordered the food home and I was shocked to see the quantity of the green chutney given. it was extremely less like a prasadham. Atleast the quantity of prasadham would be more than the green chutney.For the price we have paid it was …" },
  { name: "Param", text: "Simple, straightforward and tasty barbecue shop offering a variety of chicken and paneer kebabs, shawarmas. Ambience is clean and neat. A self ordering system is available where customers can scan and pay. Pricing is also good. …" },
  { name: "Shoaib Ahmed", text: "Walked over 2km just to get here after seeing good reviews on maps and catchy posters. But the shawarma was the blandest one I've ever had. It was juicy, so I expected it to be good, but it was completely flavourless and lacked even a …" },
  { name: "callmevenki 008", text: "We tried the grilled chicken and it was super tasty! Hope they keep up the same quality — wishing the owner all the best! …" },
  { name: "Avishek Samal", text: "Kebabs and grilled chicken that truly stand out—perfectly roasted, bursting with flavor, and seasoned with a spot-on blend of masalas. A delight for anyone who loves well-done grills. …" },
  { name: "rajesh somarouthu", text: "Taste was amazing here ,service is good and place was full hygiene. Only minus point is no sitting area .if you have car you can sit inside the car …" },
  { name: "pagadala anusha", text: "Must try food . All Chicken spls are very tasty .Dining is little small overall I give 5 star rating . very good thing is they maintain hygiene which attracted me a lot along with food taste …" },
  { name: "pavan kumar", text: "quality food. service is quick and staff are friendly. ambience is clean and there is ample space for car parking. they even have haleem now 🙂 …" },
  { name: "Rohit Dochaniya", text: "If you want really good shawarma, kebab and haleem please visit here once. I must say you will fall in love with this place …" },
];

export default function ReviewsPage() {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#0a0608", color: "#F5EDD8", fontFamily: "'Imprima', sans-serif" }}>
      
      {/* Background theme elements */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at center, transparent 10%, #0a0608 85%), linear-gradient(rgba(255,85,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.02) 1px, transparent 1px)", backgroundSize: "100% 100%, 40px 40px, 40px 40px" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40dvh", background: "linear-gradient(to top, rgba(255,85,0,0.05), transparent)", filter: "sepia(1) hue-rotate(-20deg) saturate(2)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <nav style={{ marginBottom: "40px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#FF5500", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "0.1em" }}>
            <ArrowLeft size={20} /> BACK TO FIRE
          </Link>
        </nav>

        <header style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 90px)", color: "#F5EDD8", letterSpacing: "0.05em", margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
            VOICES OF THE <span style={{ color: "#FF5500" }}>FLAME</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", color: "rgba(245,237,216,0.8)", marginTop: "12px", letterSpacing: "0.05em" }}>
            What our guests say about their experience.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {REVIEWS.map((review, i) => (
            <div key={i} style={{ borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,85,0,0.2)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", backgroundColor: "rgba(20,10,10,0.5)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "rgba(255,85,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,85,0,0.4)" }}>
                  <User size={20} color="#FF5500" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "0.05em", color: "#F5EDD8" }}>{review.name}</h4>
                  <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={12} fill="#FF5500" color="#FF5500" />)}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", lineHeight: "1.6", color: "rgba(245,237,216,0.85)", margin: 0 }}>
                &quot;{review.text}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
