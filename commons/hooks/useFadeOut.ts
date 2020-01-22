import { useEffect, useState, Dispatch, SetStateAction } from 'react';

const useFadding = (
  timeout: number,
  defaultShow: boolean = true
): [boolean, boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isHidden, setHidden] = useState(defaultShow);
  const [isAnimating, setAnimating] = useState(false);
  const [isHiddenCSS, setHiddenCSS] = useState(true);

  useEffect(() => {
    let hiddenClassTimer: NodeJS.Timeout | null = null;

    if (isHidden) {
      setAnimating(true);
      hiddenClassTimer = setTimeout(() => {
        setAnimating(false);
        setHiddenCSS(true);
      }, timeout);
    } else {
      setHiddenCSS(false);
      setAnimating(false);
    }

    return () => {
      clearTimeout(hiddenClassTimer as NodeJS.Timeout);
    };
  }, [isHidden]);

  return [isHiddenCSS, isAnimating, setHidden];
};

export default useFadding;
