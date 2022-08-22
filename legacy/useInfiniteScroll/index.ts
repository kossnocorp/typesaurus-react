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
      const windowHeight = target.clientHeight
      const leftHeight = pageHeight - scrollY - windowHeight

      if (leftHeight < windowHeight * treshold) {
        loadMore && loadMore()
      }
    }

    handleScroll()

    const eventTarget = element || document
    eventTarget.addEventListener('scroll', handleScroll)
    return () => {
      eventTarget.removeEventListener('scroll', handleScroll)
    }
  }, [loadMore, element])
}
