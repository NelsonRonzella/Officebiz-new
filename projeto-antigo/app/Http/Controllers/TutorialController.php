<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use App\Models\Product;
use App\Http\Requests\StoreTutorialRequest;
use Illuminate\Http\Request;

class TutorialController extends Controller
{

    public function index()
    {

        $tutorials = Tutorial::with('products')
            ->latest()
            ->paginate(12);

        $products = Product::orderBy('name')->get();

        return view(
            'tutoriais',
            [
                'tutorials' => $tutorials,
                'products' => $products
            ]
        );

    }


    public function store(StoreTutorialRequest $request)
    {

        $tutorial = Tutorial::create(
            $request->validated()
        );

        if ($request->filled('products')) {

            $tutorial->products()->sync(
                $request->products
            );

        }

        if ($request->ajax()) {
            return response()->json(['message' => 'Tutorial cadastrado com sucesso!']);
        }

        return back()->with(
            'success',
            'Tutorial cadastrado'
        );

    }


    public function destroy(Request $request, $id)
    {

        $tutorial = Tutorial::findOrFail($id);

        $tutorial->delete();

        if ($request->ajax()) {
            return response()->json(['message' => 'Tutorial excluído com sucesso!']);
        }

        return back()->with(
            'success',
            'Tutorial excluído'
        );

    }

}