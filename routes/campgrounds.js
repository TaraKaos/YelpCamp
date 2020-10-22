var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Showall
router.get("/", function(req, res)
{
	// Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds)
	{
		if (err)
		{
			console.log(err);
		}
		else
		{
			res.render("campgrounds/index", {campgrounds: allCampgrounds});	
		}
	});
});

//Create
router.post("/", middleware.isLoggedIn, function(req, res)
{
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
	
	// Create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated)
	{
		if (err)
		{
			console.log(err);
		}
		else
		{
			// redirect back to campgrounds page
			console.log(newlyCreated);
			res.redirect("/campgrounds");	
		}
	});	
});

// New
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res)
{
	//find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground)
	{
		if (err)
		{
			console.log(err);
		}
		else
		{
			console.log(foundCampground);
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res)
{
	Campground.findById(req.params.id, function(err, foundCampground)
	{
		if (err)
		{
			console.log(err);
			req.flash("error", "Campground not found");
			res.redirect("/campgrounds");
		}
		else
		{
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res)
{
	// find and update the correct campgrounds
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updated)
	{
		if (err)
		{
			console.log(err);
			
			res.redirect("/campgrounds");
		}
		else
		{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
	
	//redirect somewhaere(show page)
});

// DESTORY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res)
{
	Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved)
	{
    	if (err) 
		{
        	console.log(err);
        }
        
		Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, function(err)
		{
        	if (err)
			{
            	console.log(err);
            }
            
			res.redirect("/campgrounds");
        });
    });
});

module.exports = router;