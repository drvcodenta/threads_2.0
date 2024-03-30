import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Page() {

  const user = await currentUser();
  if(!user) return null;

  const userInfo = await fetchUser(user.id);
  // ...
  if (!userInfo?.onboarded) redirect('/onboarding'); // Use the 'redirect' function
        //get activity
  const activity = await getActivity(userInfo._id);
    return (
      <section>
      <h1 className="head-text">Activity Page</h1>
        <section className='mt-10 flex flex-col gap-5'>
          {activity.length > 0 ? (
            <>
            {activity.map((activity)  => (
              <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                <article className="flex items-center">
                  <Image 
                  src={activity.author.image}
                  alt="Profile picture"
                  width={20}
                  height={20}
                  className="rounded-full"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="ml-1 text-primary-500">
                      {activity.author.name}
                    </span>{" "}
                    replied to your channel
                  </p>
                </article>
              </Link>
            ))}
            </>
          ): (<p className="!text-base-regular text-light-3">No activity found</p>)}
        </section>
      </section>
    )
  }
  
  export default Page;