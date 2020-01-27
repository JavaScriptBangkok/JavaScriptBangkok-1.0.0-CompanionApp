/* eslint-disable @typescript-eslint/indent */
import React, { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import Card from './Card';
import { ModalStore } from '../stores/authModalStores';

interface PropTypes {
  modalStore: ModalStore;
  noCloseButton?: boolean;
}

const Modal: React.FC<PropTypes> = observer(
  ({ children, modalStore, noCloseButton = false }) => {
    const closeModal = useCallback(() => {
      modalStore.setModalOpen(false);
    }, []);

    const content = useMemo(() => {
      return (
        <Card className='flex flex-col items-center '>
          {!noCloseButton && <button onClick={closeModal}>Close</button>}
          {children}
        </Card>
      );
    }, [noCloseButton, children]);

    const { isAnimating, isHidden, isModalOpen } = modalStore;

    const ANIMATION_CLASSES = noCloseButton
      ? `${isAnimating ? 'fade-out' : ''} ${isHidden ? 'hidden' : ''}`
      : `${isAnimating && !isModalOpen ? 'opacity-0' : ''} ${
          isHidden ? 'invisible opacity-0' : ''
        } fade`;
    const MODAL_CLASSES = `fixed flex justify-center pin-l pin-t my-4 px-4 z-50 ${ANIMATION_CLASSES}`;

    return <div className={MODAL_CLASSES}>{content}</div>;
  }
);

export default Modal;
