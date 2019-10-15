module.exports = `

  enum Operator{
    like
    or
    and
    eq
    between
    in
    gt
    gte
    lt
    lte
    ne
  }

  enum Order{
    DESC
    ASC
  }

  input typeValue{
    type: String
    value: String!
  }

  input paginationInput{
    limit: Int
    offset: Int
  }

  scalar Date
  scalar Time
  scalar DateTime
`;