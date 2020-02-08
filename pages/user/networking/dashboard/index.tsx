import { observer, useLocalStore } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../../../commons/components/Button';
import Card from '../../../../commons/components/Card';
import Loading from '../../../../commons/components/Loading';
import {
  FirebaseModule,
  getEnvName,
  useFirestoreSnapshot
} from '../../../../commons/firebase';
import addUserToNetwork, {
  useNetworking
} from '../../../../commons/hooks/networkingHooks';
import createModalStore from '../../../../commons/stores/authModalStores';
import { withRequiredAuthentication } from '../../../../components/authentication';
import BadgeList from '../../../../components/networking/BadgeList';
import FriendList from '../../../../components/networking/FriendList';
import ProfileModal from '../../../../components/networking/ProfileModal';
import TimeOut from '../../../../components/networking/timeout';
import Winner from '../../../../components/networking/winner';
import { ModalType } from '../../../../interfaces/Commons';
import { Network } from '../../../../interfaces/Users';

const QrReader = dynamic(() => import('react-qr-reader'), {
  ssr: false,
  // eslint-disable-next-line react/display-name
  loading: () => <Loading message='loading' />
});

const onlyUnique = (value: number, index: number, self: number[]) => {
  return self.indexOf(value) === index;
};

const Dashboard: React.FC = observer(() => {
  const router = useRouter();
  const [isCameraOpen, openCamera] = useState(false);
  const network = useNetworking();
  const [selectedProfile, setSelectedProfile] = useState<Network>();
  const modalStore = useLocalStore(() => createModalStore(400, false));

  useEffect(() => {
    if (network.status === 'notRegistered') {
      router.push('/user/networking/welcome');
    }
  }, [network.status]);

  const isLoading = network.status === 'loading';

  const handleScan = (data: string | null) => {
    if (data) {
      addUserToNetwork(data);
      openCamera(false);
    }
  };

  const openModal = useCallback((profile: Network) => {
    setSelectedProfile(profile);
    modalStore.setModalType(ModalType.normal);
    modalStore.setModalOpen(true);
  }, []);

  const networks = network.data?.networks;
  const BadgeItems = useMemo(() => {
    const badges = networks?.map(_network => _network.badge);
    badges?.unshift(network.data!.badge);
    const uniqueBadges = badges?.filter(onlyUnique);
    const badgesAmount = uniqueBadges ? uniqueBadges.length : 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 7; i++) {
      if (!uniqueBadges?.includes(i)) uniqueBadges?.push(i);
    }
    const badgesComponents = uniqueBadges?.map(
      (badge, i) =>
        badge && (
          <div
            key={badge}
            className={`w-10 sm:w-auto ${i === 0 ? '' : 'ml-3'} ${
              badgesAmount < i + 1 ? 'opacity-25' : ''
            }`}
            style={badgesAmount < i + 1 ? { filter: 'blur(3px)' } : {}}
          >
            <BadgeList id={badge} />
          </div>
        )
    );
    return (
      <div className='flex flex-wrap justify-center overflow-x-auto'>
        {badgesComponents}
      </div>
    );
  }, [networks]);

  const NetworkingResult = useMemo(() => {
    if (network.hasAllWinner === true) {
      if (network.isWinner) {
        return <Winner />;
      }
      return <TimeOut />;
    }
    return null;
  }, [network.hasAllWinner]);

  const networkingCard = useMemo(() => {
    return (
      NetworkingResult || (
        <Card className='flex w-full items-center text-lg flex-col font-bold justify-center items-end'>
          {isCameraOpen ? (
            <div className='w-full h-full mb-4'>
              <QrReader
                delay={300}
                onError={() => {}}
                onScan={handleScan}
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <>
              <div>Your QR code is</div>
              <div className='my-4'>
                <QRCode value={`${network.uuid}`} />
              </div>
            </>
          )}
          <Button
            className='text-yellow-dark border-2 border-yellow-dark py-1 px-3 mb-1 flex items-center rounded-lg'
            type='button'
            onClick={() => {
              openCamera(!isCameraOpen);
            }}
          >
            <div className='w-5 h-5 ml-1 my-1 mr-2 bg-yellow-dark' />
            {isCameraOpen ? 'Close Camera' : 'Open Camera'}
          </Button>
        </Card>
      )
    );
  }, [isCameraOpen, network]);

  return (
    <>
      <ProfileModal modalStore={modalStore} profile={selectedProfile} />
      <div className={`m-4 ${isLoading ? 'hidden' : ''}`}>
        <div className='flex justify-center w-full items-center mb-4'>
          {networkingCard}
        </div>
        <div className='text-white text-lg font-bold'>Total Badge</div>
        <div className='flex mt-2'>{BadgeItems}</div>
        <div className='mt-4'>
          <div className='text-white text-lg font-bold mb-2'>
            Your new Friends
          </div>
          <Card noPadding>
            <FriendList
              openModal={openModal}
              networks={network.data?.networks}
            />
          </Card>
        </div>
        <div className='w-full flex flex-row justify-center'>
          <Link href='/user/networking/editbio'>
            <a href='/user/networking/editbio'>
              <Button
                className='w-auto py-2 px-3 bg-yellow-dark rounded-bg text-lg mt-5'
                type='submit'
              >
                Edit Bio
              </Button>
            </a>
          </Link>
        </div>
      </div>
    </>
  );
});

const withComingSoon: <T>(
  BaseComponent: React.ComponentType<T>
) => React.ComponentType<T> = BaseComponent => {
  return function ComingSoon(props) {
    const [enabled, setEnabled] = useState();
    const getDocument = useCallback(
      (firebase: FirebaseModule) =>
        firebase
          .getEnvDoc()
          .collection('networking')
          .doc('properties'),
      []
    );
    const properties = useFirestoreSnapshot(getDocument);

    useEffect(() => {
      const isEnabled =
        properties.data?.data()?.isEnabled || getEnvName() === 'test';
      setEnabled(isEnabled);
    }, [properties.data?.data()?.isEnabled]);
    const isLoading = properties.status === 'loading';
    if (isLoading) {
      return <Loading message='Loading' color='light' />;
    }
    return enabled ? (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <BaseComponent {...props} />
    ) : (
      <Card className='m-4'>
        <div className='my-4'>
          Networking features are in development, please stay tuned...
        </div>
      </Card>
    );
  };
};

export default withRequiredAuthentication(withComingSoon(Dashboard));
