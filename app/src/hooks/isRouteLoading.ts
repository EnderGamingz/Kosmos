import { useNavigation } from 'react-router-dom';

export function useIsRouteLoading() {
  const navigation = useNavigation();

  return navigation.state === 'loading';
}
