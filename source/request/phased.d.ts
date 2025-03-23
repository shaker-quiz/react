import { Phases } from '@shakerquiz/utilities'
import { useState } from 'react'

export let phased: <Contract extends { fetch: any }>(
  contract: Contract,
) =>
  & Contract
  & {
    phase: keyof typeof Phases
  }
