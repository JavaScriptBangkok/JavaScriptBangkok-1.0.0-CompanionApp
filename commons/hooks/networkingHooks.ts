/* eslint-disable @typescript-eslint/indent */
import { useCallback, useEffect, useState } from 'react';
import {
  isFetchingCompleted,
  isFetchingFailed,
  Networking
} from '../../interfaces/Commons';
import { NetworkingProfile } from '../../interfaces/Users';
import {
  FirebaseModule,
  getEnvName,
  getFirebase,
  useFirestoreSnapshot,
  useRealtimeDatabaseSnapshot
} from '../firebase';

export default async function addUserToNetwork(uid: string) {
  const firebase = await getFirebase();
  const _addUserToNetwork = firebase
    .functions('asia-northeast1')
    .httpsCallable('addUserToNetwork');
  await _addUserToNetwork({
    uid,
    env: getEnvName()
  });
}

export async function createNetworkingProfile(bio: string) {
  const firebase = await getFirebase();
  const _createNetworkingProfile = firebase
    .functions('asia-northeast1')
    .httpsCallable('createNetworkingProfile');
  await _createNetworkingProfile({
    uid: firebase.auth().currentUser!.uid,
    env: getEnvName(),
    bio
  });
}

export async function getNetworkingProfile(uid: string) {
  const firebase = await getFirebase();
  const _getNetworkingProfile = firebase
    .functions('asia-northeast1')
    .httpsCallable('getNetworkingProfile');
  return _getNetworkingProfile({
    uid,
    env: getEnvName()
  });
}

export async function updateBio(bio: string) {
  const firebase = await getFirebase();
  const _createNetworkingProfile = firebase
    .functions('asia-northeast1')
    .httpsCallable('updateBio');
  await _createNetworkingProfile({
    bio,
    env: getEnvName()
  });
}

export const useNetworking = (): Networking => {
  const [uuid, setUuid] = useState();

  const getDocument = useCallback(
    (firebase: FirebaseModule) =>
      firebase
        .getEnvDoc()
        .collection('networkingProfiles')
        .doc(firebase.auth().currentUser!.uid),
    []
  );

  const getWinner = useCallback(
    (firebase: FirebaseModule) =>
      firebase
        .getEnvRef()
        .child('networking')
        .child('winners'),
    []
  );

  const snapshotFetchResult = useFirestoreSnapshot(getDocument);
  const realtimeFetchResult = useRealtimeDatabaseSnapshot(getWinner);

  useEffect(() => {
    getFirebase().then(firebase => {
      setUuid(firebase.auth().currentUser!.uid);
    });
  }, []);

  const winners = realtimeFetchResult.data?.val();
  const winnersArray = winners ? Object.entries(winners) : [];
  const hasAllWinner = winnersArray.length >= 4;
  const isWinner =
    hasAllWinner &&
    winnersArray
      .sort((w1, w2) => (w1 as any)[1] - (w2 as any)[1])
      .slice(0, 4)
      .filter(winner => {
        return winner[0] === uuid;
      }).length !== 0;

  if (isFetchingFailed(snapshotFetchResult)) {
    return { status: 'error', error: snapshotFetchResult.error };
  }
  if (!isFetchingCompleted(snapshotFetchResult)) {
    return { status: 'loading' };
  }

  const snapshot = snapshotFetchResult.data;
  const result = {
    status: 'completed',
    data: snapshot.data() as NetworkingProfile,
    hasAllWinner,
    isWinner,
    uuid: snapshot.id
  };

  if (result.status === 'completed' && result.data === undefined) {
    return { status: 'notRegistered' };
  }
  return result;
};
