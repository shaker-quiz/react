import { extensions } from '@shakerquiz/utilities'
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
    let onbefore = request => {
      reference.current = new AbortController()

      return new Request(request, { signal: reference.current?.signal })
    }

    let onfulfilled = response => {
      reference.current = null

      return response
    }

    let onrejected = reason => {
      reference.current = null

      throw reason
    }

    extensions
      .get(contract.fetch)
      .get('onbefore')
      .add(onbefore)

    extensions
      .get(contract.fetch)
      .get('onfulfilled')
      .add(onfulfilled)

    extensions
      .get(contract.fetch)
      .get('onrejected')
      .add(onrejected)

    return () => {
      extensions
        .get(contract.fetch)
        .get('onbefore')
        .delete(onbefore)

      extensions
        .get(contract.fetch)
        .get('onfulfilled')
        .delete(onfulfilled)

      extensions
        .get(contract.fetch)
        .get('onrejected')
        .delete(onrejected)

      if (reference.current)
        reference.current.abort(AbortError(
          `'useEffect' destructor has been called.`,
        ))
    }
  }, [])

  return {
    ...contract,
    controller: reference.current,
  }
}
