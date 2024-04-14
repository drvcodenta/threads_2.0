import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_/ui/tabs"
import ProfileHeader from "@/components/forms/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadTab";
import { profileTabs } from "@/constants";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page({params}:{params: {id: string}}) {

    const user = await currentUser();
    if(!user) return null;

        const userInfo = await fetchUser(params.id);
        // ...
        if (!userInfo?.onboarded) redirect('/onboarding'); // Use the 'redirect' function

        return (
            <section>
                <ProfileHeader
                    accountId={userInfo.userId}
                    authUserId={user.id}
                    name={userInfo.name} // Add 'name' property to 'User' type
                    userName={userInfo.userName}
                    imgUrl={userInfo.image}
                    bio={userInfo.bio}
                />
                <div className="mt-9">
                    <Tabs defaultValue="threads" className="w-full">
                        <TabsList className="tab">
                            {profileTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.label}
                                    value={tab.value}
                                    className="tab"
                                >
                                    <p className="max-sm:hidden">{tab.label}</p>

                                    {tab.label === "Threads" && (
                                        <p className="ml-1 px-2 py-1 bg-light-4 rounded-sm !text-tiny-medium text-light-2">{userInfo?.threads?.length}</p>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {profileTabs.map((tab) => (
                            <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
                                <ThreadsTab
                                currentUserId={user.id}
                                accountId={userInfo.id}
                                accountType="User" />
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </section>
        );
}

export default Page;