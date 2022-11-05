'use strict'

const express = require('express')
const axios = require('axios')
const helmet = require('helmet')
const cors = require('cors')

const logger = require('express-pino-logger')()

const app = express()
app.use(logger)
app.use(helmet())
app.use(cors())

const POST_URL = 'https://jsonplaceholder.typicode.com'
const POST_KEY = ['post_id', 'post_title', 'post_body']
const POST_KEY_MAP = {
  post_id: 'postId',
  post_title: 'name',
  post_body: 'body',
}
app.get('/post/all', async (req, res) => {
  let result = await axios.get(POST_URL + '/comments')
  const total_len = result.data.length
  result = result.data.map((result) => ({
    post_id: result.postId,
    post_title: result.name,
    post_body: result.body,
    total_number_of_comments: total_len,
  }))
  res.status(200).json(result)
})

app.get('/post/all/:key/:value', async (req, res) => {
  const filter_field = req.params.key
  const filter_value = req.params.value
//   console.log(
//     `filter_field -> {${filter_field}}, filter_value -> {${filter_value}}`,
//   )
  if (!POST_KEY.includes(filter_field)) {
    res.status(400).json({
      error:
        "The field that you pass in is not valid, the valid fields are ['post_id', 'post_title', 'post_body']",
    })
  }

  let result = await axios.get(POST_URL + '/comments')
  
  const key = POST_KEY_MAP[filter_field]
//   console.log('field => ', key)
  result = result.data
  if (key === 'postId') {
    result = result.filter(function (result) {
      return result[key] == filter_value
    })
  } else {
    result = result.filter(function (result) {
      return result[key].toString().toLowerCase().indexOf(filter_value) > -1
    })
  }
  const total_len = result.length
  result = result.map((result) => ({
    post_id: result.postId,
    post_title: result.name,
    post_body: result.body,
    total_number_of_comments: total_len,
  }))
  res.status(200).json(result)
})

app.get('/post/:id', async (req, res) => {
  const id = req.params.id
  // console.log('post id: ' + id)
  if (!id || id == undefined || id == null) {
    res.status(400).json({ error: 'param is missing' })
  }
  const reg = new RegExp('^[0-9]+$')
  if (!reg.test(id)) {
    res.status(400).send({ error: "Expecting number but received isn't" })
  } else {
    try {
      const url = POST_URL + '/posts/' + id
      // console.log('requesting data to -->' + url)
      let resp = await axios.get(url)
      // console.log('result -> ', resp.data)
      resp = resp.data
      let result = {}
      result['post_id'] = resp.id
      result['post_title'] = resp.title
      result['post_body'] = resp.body
      result['total_number_of_comments'] = 1
      Object.freeze(result)
      res.status(200).json(result)
    } catch (error) {
      console.log('ERROR::GET_POST_BY_ID', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

app.listen(4000, () => console.log('server is running on port 4000'))
