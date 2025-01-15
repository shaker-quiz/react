import { Extensions } from '@shakerquiz/utilities'
import { AbortError } from '@yurkimus/errors'
import { useCallback, useEffect, useRef } from 'react'

/**
 * @template {{ fetch: any }} Contract
 *
 * @param {Contract} contract
 */
export let cancellable = contract => {
  /** @type {import('react').RefObject<AbortController>} */
  let reference = useRef(null)

  let onbefore = useCallback(
    parameters => {
      if (reference.current === null)
        reference.current = new AbortController()

      init.signal = reference.current.signal

      return parameters
    },
    [],
  )

  let onfulfilled = useCallback(
    contract => {
      reference.current = null

      return contract
    },
    [],
  )

  let onrejected = useCallback(
    reason => {
      reference.current = null

      throw reason
    },
    [],
  )

  useEffect(() => {
    Extensions
      .get(contract.fetch)
      .get('onbefore')
      .add(onbefore)

    Extensions
      .get(contract.fetch)
      .get('onfulfilled')
      .add(onfulfilled)

    Extensions
      .get(contract.fetch)
      .get('onrejected')
      .add(onrejected)

    return () => {
      if (reference.current)
        reference.current.abort(AbortError(
          `'useEffect' destructr has been called.`,
        ))

      Extensions
        .get(contract.fetch)
        .get('onbefore')
        .delete(onbefore)

      Extensions
        .get(contract.fetch)
        .get('onfulfilled')
        .delete(onfulfilled)

      Extensions
        .get(contract.fetch)
        .get('onrejected')
        .delete(onrejected)
    }
  }, [])

  return {
    ...contract,
    controller: reference.current,
  }
}
