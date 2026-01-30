import { Header } from "components";

const dashboard = () => {
  const user = {
    name: "John Doe",
    email: "p0m5o@example.com",
    imageUrl: "/assets/images/david.webp",
  };

  return (
    <main className="dashboard wrapper">
      <Header
        title={`Welcome ${user.name ?? "Guest"}`}
        description={"Track your trips and activities"}
      />
      Dashboard
    </main>
  );
};

export default dashboard;
