import { useEffect } from '../adaptor'
import { InfiniteLoadMoreState } from '../_lib/infinite'

export default function useInfiniteScroll(
  treshold: number,
  loadMore: InfiniteLoadMoreState
) {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const pageHeight = document.body.scrollHeight
      const windowHeight = window.innerHeight
      const leftHeight = pageHeight - scrollY - windowHeight

      if (leftHeight < windowHeight * treshold) {
        loadMore && loadMore()
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loadMore])
}
