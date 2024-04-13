
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_/ui/tabs"
import ThreadsTab from "@/components/shared/ThreadTab";
import ProfileHeader from "@/components/forms/ProfileHeader";
import { communityTabs } from "@/constants";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import UserCard from "@/components/cards/UserCard";

async function Page({params}:{params: {id: string}}) {

    const user = await currentUser();
    if(!user) return null;
    const communityDetails = await fetchCommunityDetails(params.id)
        return (
            <section>
                <ProfileHeader
                    accountId={communityDetails.userId}
                    authUserId={user.id}
                    name={communityDetails.name} // Add 'name' property to 'User' type
                    userName={communityDetails.userName}
                    imgUrl={communityDetails.image}
                    bio={communityDetails.bio}
                    type="Community"
                />
                <div className="mt-9">
                    <Tabs defaultValue="threads" className="w-full">
                        <TabsList className="tab">
                            {communityTabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.label}
                                    value={tab.value}
                                    className="tab"
                                >
                                    <Image
                                        src={tab.icon}
                                        alt={tab.label}
                                        height={24}
                                        width={24}
                                        className="object-contain"
                                    />
                                    <p className="max-sm:hidden">{tab.label}</p>

                                    {tab.label === "Threads" && (
                                        <p className="ml-1 px-2 py-1 bg-light-4 rounded-sm !text-tiny-medium text-light-2">{communityDetails?.threads?.length}</p>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                            <TabsContent value="threads" className="w-full text-light-1">
                                <ThreadsTab
                                currentUserId={user.id}
                                accountId={communityDetails._id}
                                accountType="Community" />
                            </TabsContent>
                            <TabsContent value="members" className="w-full text-light-1">
                                <section className="mt-9 flex flex-col gap-10 ">
                                    {communityDetails?.members.map((member: any) => (
                                        <UserCard
                                        key={member.id}
                                        id={member.id}
                                        name={member.name}
                                        username={member.username}
                                        imgUrl={member.image}
                                        personType="User" />
                                    ))}
                                </section>
                            </TabsContent>
                            <TabsContent value="requests" className="w-full text-light-1">
                                <ThreadsTab
                                currentUserId={user.id}
                                accountId={communityDetails._id}
                                accountType="Community" />
                            </TabsContent>
                    </Tabs>
                </div>
            </section>
        );
}

export default Page;