import { useEffect } from '../adaptor'
import { InfiniteLoadMoreState } from '../_lib/infinite'

export default function useInfiniteScroll(
  treshold: number,
  loadMore: InfiniteLoadMoreState,
  element?: HTMLElement
) {
  useEffect(() => {
    const target = element || document.body

    const handleScroll = () => {
      const scrollY = element ? element.scrollTop : window.scrollY
      const pageHeight = target.scrollHeight
      const windowHeight = window.innerHeight
      const leftHeight = pageHeight - scrollY - windowHeight

      if (leftHeight < windowHeight * treshold) {
        loadMore && loadMore()
      }
    }

    handleScroll()
    target.addEventListener('scroll', handleScroll)
    return () => {
      target.removeEventListener('scroll', handleScroll)
    }
  }, [loadMore, element])
}
