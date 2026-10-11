export function StillBackdrop({ realm }: { realm: "ocean" | "space" }) {
  return (
    <div className={realm === "ocean" ? "still-ocean" : "still-space"} aria-hidden="true">
      <div className="still-horizon" />
    </div>
  );
}
