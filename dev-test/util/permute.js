export const permute = (...values) =>
  values.length > 1
    ? permute(
        values[0].reduce((acc, i) => {
          return [...acc, ...values[1].map(j => [].concat(i).concat(j))]
        }, [])
      )
    : values[0]
