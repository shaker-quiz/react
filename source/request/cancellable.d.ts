export let cancellable: <Contract extends { fetch: any }>(
  contract: Contract,
) =>
  & Contract
  & {
    controller: AbortController
  }
