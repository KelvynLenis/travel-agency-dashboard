import { Header } from "components";
import React from "react";

const AllUsers = () => {
  return (
    <main className="dashboard wrapper">
      <Header
        title={`Trips page`}
        description={"Check out our current users in realtime"}
      />
      All users page contents
    </main>
  );
};

export default AllUsers;
