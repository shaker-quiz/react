import { Extensions } from '@shakerquiz/utilities'
import { AbortError } from '@yurkimus/errors'
import { useEffect, useRef } from 'react'

/**
 * @template {{ fetch: any }} Contract
 *
 * @param {Contract} contract
 */
export let cancellable = contract => {
  /** @type {import('react').RefObject<AbortController>} */
  let reference = useRef(null)

  useEffect(() => {
    let onbefore = parameters => {
      if (reference.current === null)
        reference.current = new AbortController()

      parameters
        .at(1)
        .signal = reference.current.signal

      return parameters
    }

    let onfulfilled = contract => {
      reference.current = null

      return contract
    }

    let onrejected = reason => void (reference.current = null)

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
          `'useEffect' destructor has been called.`,
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
