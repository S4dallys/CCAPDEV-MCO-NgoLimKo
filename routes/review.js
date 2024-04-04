const express = require("express")
const router = express.Router()
const multer = require("multer")
const query = require("../utility/query")
const error = require("../utility/error")
const checkAuthenticate = require("../utility/checkauthenticate")

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/imgs/uploads')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)
    }
})

const maxuploads = 4
const upload = multer({ storage: storage })

router.post("/:restoId/new", upload.array("rv-images", maxuploads), async (req, res) => {
    try {
        const restoId = req.params.restoId
        const [profile, resto] = await Promise.all([
            query.getProfile({ name: "anonymous" }),
            query.getResto({ name: restoId })
        ])

        if (!profile) {
            error.throwLoginError()
        }

        if (!resto) {
            error.throwRestoError()
        }

        const data = {
            restoId: resto._id,
            profileId: profile._id,
            title: req.body["rv-title"],
            body: req.body["rv-body"],
            uploads: req.files.map((i) => {
                return i.filename
            }),
            lastUpdated: new Date(),
            stars: req.body["rv-stars"],
        }

        const newReview = await query.insertReview(data)

        res.redirect(`/resto/id/${restoId}`)

        console.log(`POST -> ${resto.name} - ${req.body["rv-title"]}`)
        console.log(`\n--- UPLOAD ---\n${newReview}\n--------------\n`)
    } catch (err) {
        console.log(`ERROR! ${err.message}`)

        if (err.name !== "LoginError" && err.name !== "RestoError") {
            res.redirect(`/error`)
        } else {
            res.redirect(`/error?errorMsg=${err.message}`)
        }
    }
})

router.post("/vote", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            res.status(403).send("User is not authenticated.")
            return
        }

        const { id, vote } = req.body
        await query.updateLikes(id, req.user._id, vote)

        console.log(`REVIEW: ${id} gains a ${vote}.`)
        res.status(200).send("Success!")
    } catch (err) {
        console.log(err)
        res.status(400).send("Bad Request.")
    }
})

module.exports = router
