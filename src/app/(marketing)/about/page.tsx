import UltraCard from "components/ui/UltraCard";

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-10">
      <UltraCard>
        <h1 className="text-3xl font-bold mb-4">About the AK Investment Club</h1>
        <p className="text-ak-sub leading-relaxed">
          The AK Investment Club at Ardrey Kell High School is dedicated to empowering students 
          with financial literacy, practical investment knowledge, and real-world skills. 
          Our mission is to provide a welcoming and dynamic space where students can explore 
          everything from the fundamentals of personal finance to advanced investment strategies. 
          Whether you’re curious about the stock market, passionate about economics, or eager 
          to discover careers in finance and technology, AKIC is the perfect place to grow.
        </p>
      </UltraCard>

      <UltraCard>
        <h2 className="text-2xl font-semibold mb-4">Our Officers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-black/30 p-4">
            <h3 className="text-xl font-bold">Yin Ho — President</h3>
            <p className="text-ak-sub mt-2">
              Yin is a rising Junior and the driving force behind AKIC. As a passionate 
              investor, he thrives on everything from 
              risk management to market analysis. His goal is to ensure every member 
              feels welcomed and leaves with meaningful insight into the world of finance.
            </p>
          </div>
          <div className="rounded-lg bg-black/30 p-4">
            <h3 className="text-xl font-bold">Akmal Nazir — Executive of Technology</h3>
            <p className="text-ak-sub mt-2">
              Akmal, a rising Junior, is the tech wizard of the team. From electronics 
              and systems engineering to coding and fintech, his passion projects span 
              the spectrum of technology. He ensures that AKIC provides the cleanest 
              and most intuitive experience possible for its members.
            </p>
          </div>
          <div className="rounded-lg bg-black/30 p-4">
            <h3 className="text-xl font-bold">Sai Bethi — Executive of Outreach</h3>
            <p className="text-ak-sub mt-2">
              Sai, a rising Senior, has experience at the school, state, and national 
              levels. His leadership ensures the smoothest possible club operations. 
              Sai is dedicated to growing AKIC’s presence and connecting members to 
              broader opportunities in the finance community.
            </p>
          </div>
        </div>
      </UltraCard>

      <UltraCard>
        <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
        <ul className="list-disc pl-6 space-y-2 text-ak-sub">
          <li><strong>Bi-Weekly Meetings:</strong> Covering topics like investing basics, stock analysis, and fintech trends.</li>
          <li><strong>Hands-On Simulations:</strong> Members practice trading and portfolio management in a safe, competitive environment.</li>
          <li><strong>Guest Speakers:</strong> Industry professionals share insights about careers, strategies, and the future of finance.</li>
          <li><strong>Competitions:</strong> Teams represent AKIC in local, state, and national investment challenges.</li>
          <li><strong>Community Outreach:</strong> Educating peers about financial literacy and creating broader impact in our school.</li>
        </ul>
      </UltraCard>

      <UltraCard>
        <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
        <p className="text-ak-sub leading-relaxed">
          We believe finance is not just about numbers — it’s about empowerment. By 
          teaching high school students to make informed financial decisions, we hope 
          to create a generation that is confident, forward-thinking, and ready to 
          shape the future. AKIC is more than just a club: it’s a family of learners, 
          innovators, and future leaders.
        </p>
      </UltraCard>
    </div>
  );
}
