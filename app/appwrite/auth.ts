import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, database } from "./client";
import { redirect } from "react-router";

export const loginWithGoogle = async () => {
  try {
    account.createOAuth2Session({
      provider: OAuthProvider.Google,
    });
  } catch (error) {
    console.log(error);
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getUser = async () => {
  try {
    const user = await account.get();

    if (!user) redirect("/sign-in");

    const { documents } = await database.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [
        Query.equal("accountId", user.$id),
        Query.select(["name", "email", "joinedAt", "imageUrl", "accountId"]),
      ],
    });
  } catch (error) {
    console.log(error);
  }
};

export const getGooglePicture = async () => {
  try {
    const session = await account.getSession("current");

    const oAuthToken = session.providerAccessToken;

    if (!oAuthToken) redirect("/sign-in");

    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      { headers: { Authorization: `Bearer ${oAuthToken}` } },
    );
    if (!response.ok) throw new Error("Failed to fetch Google profile picture");

    const { photos } = await response.json();
    return photos?.[0]?.url || null;
  } catch (error) {
    console.log(error);
  }
};

export const storeUserData = async () => {
  try {
    const user = await account.get();

    if (!user) return null;

    const { documents } = await database.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      queries: [Query.equal("accountId", user.$id)],
    });

    if (documents.length > 0) return documents[0];

    const imageUrl = await getGooglePicture();

    const newUser = await database.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userCollectionId,
      documentId: ID.unique(),
      data: {
        accountId: user.$id,
        name: user.name,
        email: user.email,
        imageUrl: imageUrl,
        joinedAt: new Date().toISOString(),
      },
    });

    return newUser;
  } catch (error) {
    console.log(error);
  }
};

export const getExistingUser = async (id: string) => {
  try {
    const { documents, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", id)],
    );
    return total > 0 ? documents[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const { documents: users, total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(limit), Query.offset(offset)],
    );

    if (total === 0) return { users: [], total };

    return { users, total };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0 };
  }
};
