import { Button } from "~/components/Button";
import mushroomAnimated from "~/assets/mushroom-animated.gif";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center flex-col gap-4 w-full max-w-[500px] mx-auto">
      <h1 className="font-logo text-6xl">rhizotek</h1>
      <img src={mushroomAnimated} alt="rhizotek" className="w-48 h-48" />
      <p className="text-center">mushroom cultivation education made easy: rhizotek is a web-based application that guides beginner mycologists through species-specific mushroom cultivation lifecycles.</p>
      <span className="text-center opacity-40 italic">note: for educational and research purposes only</span>
      <Button variant="primary" onClick={() => navigate("/browse")}>browse fungi</Button>
    </div>
  );
}
