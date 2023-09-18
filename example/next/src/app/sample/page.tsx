import Link from 'next/link';
import { emptyUser, sampleUser } from './domain';
import { UserFormComponent } from './form';

const Page = ({ searchParams }: { searchParams: { id?: string } }) => {
  return (
    <>
    specify id by query params so that you see an example of the form being filled out.
    <br/>
      <UserFormComponent initialData={searchParams.id ? sampleUser : emptyUser} />
      <br />
      <p>when you go to top page and then come back this page, form state would be retained.</p>
      <p>
        if you do not wish to retain the form state, enclose this component in the tree above with
        "SimpleFormJotaiBound".
      </p>

      <br />
      <Link href={'/'}>top</Link>
    </>
  );
};

export default Page;
